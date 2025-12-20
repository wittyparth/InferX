"""
Redis Caching Service
Handles caching for predictions and other heavy operations.

Memory-conscious implementation for Upstash Redis (250MB limit)
"""

import hashlib
import json
import logging
import time
from typing import Any, Optional
from dataclasses import dataclass

import redis

from app.core.config import settings

logger = logging.getLogger(__name__)


# Maximum size for cached items (1MB to be safe with 250MB limit)
MAX_CACHE_SIZE_BYTES = 1 * 1024 * 1024  # 1MB per item

# Default TTL for predictions (1 hour)
DEFAULT_PREDICTION_TTL = 3600

# Maximum number of predictions to cache per model
MAX_CACHED_PREDICTIONS_PER_MODEL = 100


@dataclass
class CacheStats:
    """Statistics for cache operations"""
    hits: int = 0
    misses: int = 0
    skipped_size: int = 0  # Skipped due to size limit
    errors: int = 0


class PredictionCache:
    """
    Redis-based cache for ML model predictions.
    
    Features:
    - Input-based cache key generation (same input = cache hit)
    - Size-aware caching (skips large outputs)
    - TTL-based expiration
    - Memory usage tracking
    """
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis = redis_client
        self.stats = CacheStats()
        self._enabled = redis_client is not None
        
        if not self._enabled:
            logger.warning("PredictionCache initialized without Redis - caching disabled")
    
    def _generate_cache_key(self, model_id: str, input_data: Any, version: Optional[int] = None) -> str:
        """
        Generate a unique cache key based on model and input.
        
        Key format: pred:{model_id}:{version}:{input_hash}
        """
        # Serialize input to JSON for consistent hashing
        input_json = json.dumps(input_data, sort_keys=True, default=str)
        input_hash = hashlib.sha256(input_json.encode()).hexdigest()[:16]
        
        version_str = str(version) if version else "latest"
        return f"pred:{model_id}:{version_str}:{input_hash}"
    
    def _estimate_size(self, data: Any) -> int:
        """Estimate the size of data in bytes"""
        try:
            return len(json.dumps(data, default=str).encode('utf-8'))
        except Exception:
            return 0
    
    async def get_prediction(
        self, 
        model_id: str, 
        input_data: Any,
        version: Optional[int] = None
    ) -> Optional[dict]:
        """
        Get a cached prediction if it exists.
        
        Args:
            model_id: The model UUID
            input_data: The prediction input
            version: Optional model version
            
        Returns:
            Cached prediction result or None if not found
        """
        if not self._enabled:
            return None
        
        cache_key = self._generate_cache_key(model_id, input_data, version)
        
        try:
            cached = self.redis.get(cache_key)
            
            if cached:
                self.stats.hits += 1
                result = json.loads(cached)
                logger.debug(f"Cache HIT for {cache_key}")
                return result
            else:
                self.stats.misses += 1
                logger.debug(f"Cache MISS for {cache_key}")
                return None
                
        except Exception as e:
            self.stats.errors += 1
            logger.error(f"Cache get error: {e}")
            return None
    
    async def set_prediction(
        self,
        model_id: str,
        input_data: Any,
        output_data: dict,
        version: Optional[int] = None,
        ttl: int = DEFAULT_PREDICTION_TTL,
    ) -> bool:
        """
        Cache a prediction result.
        
        Args:
            model_id: The model UUID
            input_data: The prediction input
            output_data: The prediction result to cache
            version: Optional model version
            ttl: Time-to-live in seconds
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self._enabled:
            return False
        
        # Check output size before caching
        output_size = self._estimate_size(output_data)
        
        if output_size > MAX_CACHE_SIZE_BYTES:
            self.stats.skipped_size += 1
            logger.info(
                f"Skipping cache for {model_id}: output size {output_size / 1024:.1f}KB "
                f"exceeds limit {MAX_CACHE_SIZE_BYTES / 1024:.1f}KB"
            )
            return False
        
        cache_key = self._generate_cache_key(model_id, input_data, version)
        
        try:
            # Store with TTL
            cache_data = json.dumps(output_data, default=str)
            self.redis.setex(cache_key, ttl, cache_data)
            
            logger.debug(f"Cached prediction: {cache_key} (size: {output_size / 1024:.1f}KB, TTL: {ttl}s)")
            return True
            
        except Exception as e:
            self.stats.errors += 1
            logger.error(f"Cache set error: {e}")
            return False
    
    async def invalidate_model_cache(self, model_id: str) -> int:
        """
        Invalidate all cached predictions for a model.
        
        Useful when a model is updated or deleted.
        
        Args:
            model_id: The model UUID
            
        Returns:
            Number of keys deleted
        """
        if not self._enabled:
            return 0
        
        try:
            # Find and delete all keys for this model
            pattern = f"pred:{model_id}:*"
            keys = list(self.redis.scan_iter(match=pattern, count=100))
            
            if keys:
                deleted = self.redis.delete(*keys)
                logger.info(f"Invalidated {deleted} cached predictions for model {model_id}")
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return 0
    
    async def get_cache_stats(self) -> dict:
        """Get cache statistics"""
        total = self.stats.hits + self.stats.misses
        hit_rate = (self.stats.hits / total * 100) if total > 0 else 0
        
        stats = {
            "hits": self.stats.hits,
            "misses": self.stats.misses,
            "hit_rate": f"{hit_rate:.1f}%",
            "skipped_due_to_size": self.stats.skipped_size,
            "errors": self.stats.errors,
            "enabled": self._enabled,
        }
        
        # Try to get memory info from Redis
        if self._enabled:
            try:
                info = self.redis.info("memory")
                stats["redis_memory_used"] = info.get("used_memory_human", "unknown")
                stats["redis_memory_peak"] = info.get("used_memory_peak_human", "unknown")
            except Exception:
                pass
        
        return stats
    
    async def get_memory_usage(self) -> dict:
        """Get Redis memory usage information"""
        if not self._enabled:
            return {"error": "Cache not enabled"}
        
        try:
            info = self.redis.info("memory")
            
            # Count prediction cache keys
            pred_keys = list(self.redis.scan_iter(match="pred:*", count=1000))
            rate_keys = list(self.redis.scan_iter(match="rate_limit:*", count=1000))
            
            return {
                "used_memory": info.get("used_memory_human", "unknown"),
                "used_memory_peak": info.get("used_memory_peak_human", "unknown"),
                "prediction_cache_keys": len(pred_keys),
                "rate_limit_keys": len(rate_keys),
                "total_keys": self.redis.dbsize(),
            }
        except Exception as e:
            return {"error": str(e)}


# Global cache instance
_prediction_cache: Optional[PredictionCache] = None


def _create_redis_client() -> Optional[redis.Redis]:
    """
    Create a Redis client compatible with both standard Redis and Upstash.
    Reuses the same connection logic as rate_limiter.
    """
    redis_url = settings.REDIS_URL
    
    if not redis_url:
        logger.warning("REDIS_URL not configured for caching")
        return None
    
    try:
        is_upstash = redis_url.startswith("rediss://") or "upstash" in redis_url.lower()
        
        if is_upstash:
            logger.info("Connecting to Upstash Redis for caching...")
            client = redis.from_url(
                redis_url,
                decode_responses=True,  # For caching, we want string responses
                ssl_cert_reqs=None,
            )
        else:
            logger.info("Connecting to standard Redis for caching...")
            client = redis.from_url(
                redis_url,
                decode_responses=True,
            )
        
        # Test connection
        client.ping()
        logger.info("Redis cache connection successful!")
        return client
        
    except Exception as e:
        logger.error(f"Redis cache connection failed: {e}")
        return None


def get_prediction_cache() -> PredictionCache:
    """Get or create the prediction cache instance"""
    global _prediction_cache
    
    if _prediction_cache is None:
        redis_client = _create_redis_client()
        _prediction_cache = PredictionCache(redis_client)
        
        if redis_client:
            logger.info("PredictionCache initialized with Redis")
        else:
            logger.warning("PredictionCache running without Redis (caching disabled)")
    
    return _prediction_cache


# FastAPI dependency
async def get_cache() -> PredictionCache:
    """FastAPI dependency to get the prediction cache"""
    return get_prediction_cache()

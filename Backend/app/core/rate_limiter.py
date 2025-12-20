"""
Rate limiting using Redis (Upstash compatible)
Implements sliding window algorithm for API rate limiting
"""

import logging
import time
from typing import Optional

import redis
from fastapi import HTTPException, Request, status

from app.core.config import settings

logger = logging.getLogger(__name__)


class NullRateLimiter:
    """
    Fallback rate limiter that allows all requests.
    Used when Redis is not available.
    """
    
    async def check_rate_limit(
        self, key: str, max_requests: int, window_seconds: int
    ) -> tuple[bool, dict]:
        """Always allows requests when Redis is unavailable"""
        return True, {
            "limit": max_requests,
            "remaining": max_requests,
            "reset": int(time.time() + window_seconds),
            "redis_available": False,
        }


class RateLimiter:
    """
    Redis-based rate limiter using sliding window algorithm.
    Compatible with standard Redis and Upstash Redis.
    """

    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client

    async def check_rate_limit(
        self, key: str, max_requests: int, window_seconds: int
    ) -> tuple[bool, dict]:
        """
        Check if request is within rate limit using sliding window.

        Args:
            key: Unique identifier (user_id, ip_address, etc.)
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds

        Returns:
            Tuple of (allowed: bool, metadata: dict)
        """
        try:
            current_time = time.time()
            window_start = current_time - window_seconds

            # Redis key for this rate limit
            redis_key = f"rate_limit:{key}"

            # Use pipeline for atomic operations
            pipe = self.redis.pipeline()
            
            # Remove old entries outside the window
            pipe.zremrangebyscore(redis_key, 0, window_start)
            
            # Count requests in current window
            pipe.zcard(redis_key)
            
            # Add current request with timestamp as score
            pipe.zadd(redis_key, {str(current_time): current_time})
            
            # Set TTL on the key
            pipe.expire(redis_key, window_seconds + 1)
            
            # Execute pipeline
            results = pipe.execute()
            request_count = results[1]  # zcard result

            if request_count < max_requests:
                return True, {
                    "limit": max_requests,
                    "remaining": max_requests - request_count - 1,
                    "reset": int(current_time + window_seconds),
                    "redis_available": True,
                }
            else:
                # Get oldest request time to calculate reset
                oldest = self.redis.zrange(redis_key, 0, 0, withscores=True)
                reset_time = (
                    int(oldest[0][1] + window_seconds)
                    if oldest
                    else int(current_time + window_seconds)
                )

                return False, {
                    "limit": max_requests,
                    "remaining": 0,
                    "reset": reset_time,
                    "redis_available": True,
                }

        except Exception as e:
            logger.error(f"Rate limiter error: {str(e)}")
            # Fail open - allow request if Redis is down
            return True, {
                "limit": max_requests,
                "remaining": max_requests,
                "reset": int(time.time() + window_seconds),
                "redis_available": False,
            }


# Global rate limiter instance
_rate_limiter: Optional[RateLimiter | NullRateLimiter] = None


def _create_redis_client() -> Optional[redis.Redis]:
    """
    Create a Redis client compatible with both standard Redis and Upstash.
    
    Upstash Redis URL format: rediss://default:<password>@<host>:<port>
    Standard Redis URL format: redis://<host>:<port>
    """
    redis_url = settings.REDIS_URL
    
    if not redis_url:
        logger.warning("REDIS_URL not configured")
        return None
    
    try:
        # Check if it's an Upstash URL (uses rediss:// for TLS)
        is_upstash = redis_url.startswith("rediss://") or "upstash" in redis_url.lower()
        
        if is_upstash:
            logger.info("Connecting to Upstash Redis with TLS...")
            # Upstash requires SSL/TLS connection
            client = redis.from_url(
                redis_url,
                decode_responses=False,
                ssl_cert_reqs=None,  # Don't verify SSL cert (Upstash handles this)
            )
        else:
            logger.info("Connecting to standard Redis...")
            client = redis.from_url(
                redis_url,
                decode_responses=False,
            )
        
        # Test the connection
        client.ping()
        logger.info("Redis connection successful!")
        return client
        
    except redis.exceptions.ConnectionError as e:
        logger.error(f"Redis connection failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Redis initialization error: {e}")
        return None


def get_rate_limiter() -> RateLimiter | NullRateLimiter:
    """Get or create rate limiter instance"""
    global _rate_limiter

    if _rate_limiter is None:
        redis_client = _create_redis_client()
        
        if redis_client is not None:
            _rate_limiter = RateLimiter(redis_client)
            logger.info("Rate limiter initialized with Redis")
        else:
            logger.warning("Using NullRateLimiter (all requests allowed)")
            _rate_limiter = NullRateLimiter()

    return _rate_limiter


async def rate_limit_dependency(
    request: Request, max_requests: int = 100, window_seconds: int = 60
):
    """
    FastAPI dependency for rate limiting

    Usage:
        @app.get("/endpoint", dependencies=[Depends(rate_limit_dependency)])
    """
    limiter = get_rate_limiter()

    # Use user ID if authenticated, otherwise IP address
    if hasattr(request.state, "user_id") and request.state.user_id:
        key = f"user:{request.state.user_id}"
    else:
        # Get client IP (handle proxies)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        key = f"ip:{client_ip}"

    allowed, metadata = await limiter.check_rate_limit(
        key=key, max_requests=max_requests, window_seconds=window_seconds
    )

    # Add rate limit headers to response state
    request.state.rate_limit_metadata = metadata

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "limit": metadata["limit"],
                "reset": metadata["reset"],
                "retry_after": metadata["reset"] - int(time.time()),
            },
        )


def create_rate_limit(max_requests: int, window_seconds: int):
    """
    Factory function to create rate limit dependencies with specific limits.
    
    Usage:
        from app.core.rate_limit_config import AUTH_LOGIN
        
        @router.post("/login")
        async def login(
            ...,
            _rate_limit: None = Depends(create_rate_limit(AUTH_LOGIN.max_requests, AUTH_LOGIN.window_seconds))
        ):
            ...
    """
    async def dependency(request: Request):
        await rate_limit_dependency(request, max_requests, window_seconds)
    
    return dependency


def rate_limit(config):
    """
    Create a rate limit dependency from a RateLimitConfig object.
    
    Usage:
        from app.core.rate_limit_config import AUTH_LOGIN
        
        @router.post("/login")
        async def login(
            ...,
            _rate_limit: None = Depends(rate_limit(AUTH_LOGIN))
        ):
            ...
    """
    return create_rate_limit(config.max_requests, config.window_seconds)

"""
Cloud Storage Service
Handles S3-compatible storage for model files
Supports AWS S3, MinIO, Backblaze B2, etc.
"""

from pathlib import Path

import aiofiles
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class StorageService:
    """
    Unified storage service that works with both local filesystem and S3-compatible cloud storage
    """

    def __init__(self):
        self.use_cloud = settings.USE_CLOUD_STORAGE
        self.local_dir = Path(settings.UPLOAD_DIR)

        if self.use_cloud:
            self._init_s3_client()
        else:
            self._init_local_storage()

    def _init_s3_client(self):
        """Initialize S3 client for cloud storage"""
        try:
            session = boto3.session.Session()
            self.s3_client = session.client(
                "s3",
                region_name=settings.S3_REGION,
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            self.bucket_name = settings.S3_BUCKET_NAME

            # Verify bucket exists
            self._verify_bucket()
            logger.info(f"S3 storage initialized: bucket={self.bucket_name}")

        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {e}")
            raise

    def _init_local_storage(self):
        """Initialize local filesystem storage"""
        self.local_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Local storage initialized: {self.local_dir}")

    def _verify_bucket(self):
        """Verify S3 bucket exists and is accessible"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "404":
                logger.warning(f"Bucket {self.bucket_name} not found, creating...")
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            else:
                raise

    async def save_file(self, file_path: str, content: bytes) -> str:
        """
        Save file to storage (cloud or local)

        Args:
            file_path: Relative path/key for the file
            content: Binary content of the file

        Returns:
            Storage path or URL
        """
        if self.use_cloud:
            return await self._save_to_s3(file_path, content)
        else:
            return await self._save_to_local(file_path, content)

    async def _save_to_s3(self, file_path: str, content: bytes) -> str:
        """Save file to S3"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name, Key=file_path, Body=content
            )

            # Return S3 URL
            if settings.S3_ENDPOINT_URL:
                url = f"{settings.S3_ENDPOINT_URL}/{self.bucket_name}/{file_path}"
            else:
                url = f"https://{self.bucket_name}.s3.{settings.S3_REGION}.amazonaws.com/{file_path}"

            logger.info(f"File saved to S3: {file_path}")
            return url

        except ClientError as e:
            logger.error(f"Failed to save file to S3: {e}")
            raise

    async def _save_to_local(self, file_path: str, content: bytes) -> str:
        """Save file to local filesystem"""
        full_path = self.local_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(full_path, "wb") as f:
            await f.write(content)

        logger.info(f"File saved locally: {full_path}")
        return str(full_path)

    async def load_file(self, file_path: str) -> bytes:
        """
        Load file from storage (cloud or local)

        Args:
            file_path: Relative path/key for the file

        Returns:
            Binary content of the file
        """
        if self.use_cloud:
            return await self._load_from_s3(file_path)
        else:
            return await self._load_from_local(file_path)

    async def _load_from_s3(self, file_path: str) -> bytes:
        """Load file from S3"""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=file_path)
            content = response["Body"].read()
            logger.info(f"File loaded from S3: {file_path}")
            return content

        except ClientError as e:
            logger.error(f"Failed to load file from S3: {e}")
            raise

    async def _load_from_local(self, file_path: str) -> bytes:
        """Load file from local filesystem"""
        full_path = self.local_dir / file_path

        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {full_path}")

        async with aiofiles.open(full_path, "rb") as f:
            content = await f.read()

        logger.info(f"File loaded locally: {full_path}")
        return content

    async def delete_file(self, file_path: str) -> bool:
        """
        Delete file from storage (cloud or local)

        Args:
            file_path: Relative path/key for the file

        Returns:
            True if deleted successfully
        """
        if self.use_cloud:
            return await self._delete_from_s3(file_path)
        else:
            return await self._delete_from_local(file_path)

    async def _delete_from_s3(self, file_path: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
            logger.info(f"File deleted from S3: {file_path}")
            return True

        except ClientError as e:
            logger.error(f"Failed to delete file from S3: {e}")
            return False

    async def _delete_from_local(self, file_path: str) -> bool:
        """Delete file from local filesystem"""
        try:
            full_path = self.local_dir / file_path
            if full_path.exists():
                full_path.unlink()
                logger.info(f"File deleted locally: {full_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete local file: {e}")
            return False

    async def file_exists(self, file_path: str) -> bool:
        """Check if file exists in storage"""
        if self.use_cloud:
            return await self._exists_in_s3(file_path)
        else:
            return await self._exists_locally(file_path)

    async def _exists_in_s3(self, file_path: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=file_path)
            return True
        except ClientError:
            return False

    async def _exists_locally(self, file_path: str) -> bool:
        """Check if file exists locally"""
        full_path = self.local_dir / file_path
        return full_path.exists()

    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Get a presigned URL for the file (cloud only)
        For local files, returns the file path

        Args:
            file_path: Relative path/key for the file
            expires_in: URL expiration time in seconds (default: 1 hour)

        Returns:
            Presigned URL or local file path
        """
        if self.use_cloud:
            try:
                url = self.s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket_name, "Key": file_path},
                    ExpiresIn=expires_in,
                )
                return url
            except ClientError as e:
                logger.error(f"Failed to generate presigned URL: {e}")
                raise
        else:
            return str(self.local_dir / file_path)


# Global storage service instance
storage_service = StorageService()

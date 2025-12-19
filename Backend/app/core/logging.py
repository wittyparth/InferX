"""
Logging configuration
Colored text logging for readability
"""

import logging
import sys
from datetime import datetime
from typing import Any, Dict


class ColoredFormatter(logging.Formatter):
    """Custom colored formatter for readable terminal logging"""

    # ANSI color codes
    COLORS = {
        "DEBUG": "\033[36m",      # Cyan
        "INFO": "\033[32m",       # Green
        "WARNING": "\033[33m",    # Yellow
        "ERROR": "\033[31m",      # Red
        "CRITICAL": "\033[35m",   # Magenta
    }
    RESET = "\033[0m"
    BOLD = "\033[1m"

    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record with colors and readable text

        Args:
            record: Log record to format

        Returns:
            Colored formatted log string
        """
        # Get color for log level
        level_color = self.COLORS.get(record.levelname, self.RESET)
        
        # Format timestamp
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        
        # Build the log message
        log_message = (
            f"{level_color}{self.BOLD}[{timestamp}]{self.RESET} "
            f"{level_color}{record.levelname:8}{self.RESET} "
            f"{self.BOLD}{record.name}{self.RESET} "
            f"({record.module}:{record.funcName}:{record.lineno}) "
            f"- {record.getMessage()}"
        )

        # Add exception info if present
        if record.exc_info:
            log_message += f"\n{self.formatException(record.exc_info)}"

        # Add extra fields if present
        extra_fields = []
        if hasattr(record, "user_id"):
            extra_fields.append(f"user_id={record.user_id}")
        if hasattr(record, "model_id"):
            extra_fields.append(f"model_id={record.model_id}")
        if hasattr(record, "request_id"):
            extra_fields.append(f"request_id={record.request_id}")
        
        if extra_fields:
            log_message += f" [{', '.join(extra_fields)}]"

        return log_message


def setup_logging(log_level: str = "INFO") -> None:
    """
    Configure application logging

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Get root logger
    root_logger = logging.getLogger()
    
    # Clear any existing handlers
    root_logger.handlers = []
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ColoredFormatter())
    
    # Set logging level
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Add handler to root logger
    root_logger.addHandler(handler)

    # Disable middleware and access logs
    logging.getLogger("uvicorn.access").handlers = []
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("app.core.middleware").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)

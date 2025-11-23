#!/bin/bash

###############################################################################
# Database Backup Script
# Performs automated PostgreSQL backups with S3 upload and retention management
###############################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/.env" 2>/dev/null || true

# Variables
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="mlplatform_backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Database connection details (from .env or defaults)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mlplatform}"
DB_USER="${DB_USER:-mluser}"
DB_PASSWORD="${DB_PASSWORD:-mlpassword}"

# S3 configuration (optional)
USE_S3="${USE_S3:-false}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-backups/database}"

# Retention settings
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

###############################################################################
# Functions
###############################################################################

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*"
}

check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump not found. Please install PostgreSQL client tools."
        exit 1
    fi
    
    if ! command -v gzip &> /dev/null; then
        error "gzip not found. Please install gzip."
        exit 1
    fi
    
    if [[ "${USE_S3}" == "true" ]] && ! command -v aws &> /dev/null; then
        error "AWS CLI not found. Please install aws-cli for S3 uploads."
        exit 1
    fi
    
    log "All dependencies satisfied"
}

create_backup_dir() {
    log "Creating backup directory: ${BACKUP_DIR}"
    mkdir -p "${BACKUP_DIR}"
}

perform_backup() {
    log "Starting database backup..."
    log "Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
    log "Backup file: ${BACKUP_FILE}"
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Perform backup with pg_dump and compress
    if pg_dump \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --username="${DB_USER}" \
        --dbname="${DB_NAME}" \
        --format=plain \
        --no-owner \
        --no-privileges \
        --verbose \
        2>&1 | gzip > "${BACKUP_PATH}"; then
        
        log "Backup completed successfully: ${BACKUP_PATH}"
        
        # Get backup size
        BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
        log "Backup size: ${BACKUP_SIZE}"
        
        unset PGPASSWORD
        return 0
    else
        error "Backup failed!"
        unset PGPASSWORD
        return 1
    fi
}

upload_to_s3() {
    if [[ "${USE_S3}" != "true" ]]; then
        log "S3 upload disabled, skipping..."
        return 0
    fi
    
    if [[ -z "${S3_BUCKET}" ]]; then
        warning "S3_BUCKET not set, skipping S3 upload"
        return 0
    fi
    
    log "Uploading backup to S3..."
    log "Bucket: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"
    
    if aws s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" \
        --storage-class STANDARD_IA \
        --metadata "created=$(date -Iseconds),database=${DB_NAME}"; then
        
        log "S3 upload completed successfully"
        return 0
    else
        error "S3 upload failed!"
        return 1
    fi
}

cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    # Local cleanup
    local deleted_count=0
    while IFS= read -r -d '' backup_file; do
        rm -f "${backup_file}"
        ((deleted_count++))
    done < <(find "${BACKUP_DIR}" -name "mlplatform_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -print0)
    
    if [[ ${deleted_count} -gt 0 ]]; then
        log "Deleted ${deleted_count} old local backup(s)"
    else
        log "No old local backups to delete"
    fi
    
    # S3 cleanup (if enabled)
    if [[ "${USE_S3}" == "true" ]] && [[ -n "${S3_BUCKET}" ]]; then
        log "Cleaning up old S3 backups..."
        
        # Calculate cutoff date
        CUTOFF_DATE=$(date -d "${RETENTION_DAYS} days ago" +%Y%m%d)
        
        # List and delete old backups
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
        awk '{print $4}' | \
        grep "mlplatform_backup_" | \
        while read -r s3_file; do
            # Extract date from filename (format: mlplatform_backup_YYYYMMDD_HHMMSS.sql.gz)
            file_date=$(echo "${s3_file}" | grep -oP 'mlplatform_backup_\K\d{8}')
            
            if [[ "${file_date}" -lt "${CUTOFF_DATE}" ]]; then
                log "Deleting old S3 backup: ${s3_file}"
                aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${s3_file}"
            fi
        done
    fi
}

verify_backup() {
    log "Verifying backup integrity..."
    
    # Check if file exists and is not empty
    if [[ ! -f "${BACKUP_PATH}" ]]; then
        error "Backup file not found: ${BACKUP_PATH}"
        return 1
    fi
    
    if [[ ! -s "${BACKUP_PATH}" ]]; then
        error "Backup file is empty: ${BACKUP_PATH}"
        return 1
    fi
    
    # Test gzip integrity
    if gzip -t "${BACKUP_PATH}" 2>/dev/null; then
        log "Backup integrity verified"
        return 0
    else
        error "Backup file is corrupted!"
        return 1
    fi
}

send_notification() {
    local status=$1
    local message=$2
    
    # TODO: Implement notification logic (email, Slack, webhook, etc.)
    if [[ "${status}" == "success" ]]; then
        log "✓ ${message}"
    else
        error "✗ ${message}"
    fi
}

###############################################################################
# Main Script
###############################################################################

main() {
    log "=== Database Backup Script Started ==="
    log "Environment: ${ENVIRONMENT:-production}"
    
    # Check dependencies
    check_dependencies
    
    # Create backup directory
    create_backup_dir
    
    # Perform backup
    if ! perform_backup; then
        send_notification "error" "Database backup failed"
        exit 1
    fi
    
    # Verify backup
    if ! verify_backup; then
        send_notification "error" "Backup verification failed"
        exit 1
    fi
    
    # Upload to S3
    if ! upload_to_s3; then
        warning "S3 upload failed, but local backup is available"
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Success notification
    send_notification "success" "Database backup completed successfully"
    
    log "=== Database Backup Script Completed ==="
}

# Run main function
main "$@"

#!/bin/bash

###############################################################################
# Database Restore Script
# Restores PostgreSQL database from backup (local or S3)
###############################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/.env" 2>/dev/null || true

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-mlplatform}"
DB_USER="${DB_USER:-mluser}"
DB_PASSWORD="${DB_PASSWORD:-mlpassword}"

# S3 configuration
USE_S3="${USE_S3:-false}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-backups/database}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Restore PostgreSQL database from backup

OPTIONS:
    -f, --file FILE         Local backup file to restore
    -s, --s3 KEY            S3 object key to restore from
    -l, --list              List available backups
    -h, --help              Show this help message

EXAMPLES:
    # Restore from local file
    $0 --file /tmp/backups/mlplatform_backup_20241031_120000.sql.gz
    
    # Restore from S3
    $0 --s3 mlplatform_backup_20241031_120000.sql.gz
    
    # List available backups
    $0 --list

EOF
    exit 1
}

list_backups() {
    log "Available backups:"
    echo ""
    
    # List local backups
    echo "Local backups:"
    if [[ -d "/tmp/backups" ]]; then
        find /tmp/backups -name "mlplatform_backup_*.sql.gz" -type f -printf "%T@ %Tc %p\n" | \
        sort -rn | \
        awk '{$1=""; print}' || echo "  No local backups found"
    else
        echo "  No local backups found"
    fi
    
    echo ""
    
    # List S3 backups
    if [[ "${USE_S3}" == "true" ]] && [[ -n "${S3_BUCKET}" ]]; then
        echo "S3 backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive | \
        grep "mlplatform_backup_" | \
        awk '{print "  " $1, $2, $4}' || echo "  No S3 backups found"
    fi
    
    exit 0
}

download_from_s3() {
    local s3_key=$1
    local local_path=$2
    
    log "Downloading backup from S3..."
    log "Source: s3://${S3_BUCKET}/${S3_PREFIX}/${s3_key}"
    log "Destination: ${local_path}"
    
    if aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${s3_key}" "${local_path}"; then
        log "Download completed successfully"
        return 0
    else
        error "Failed to download from S3"
        return 1
    fi
}

restore_database() {
    local backup_file=$1
    
    log "Starting database restore..."
    log "Backup file: ${backup_file}"
    log "Target database: ${DB_NAME}@${DB_HOST}:${DB_PORT}"
    
    # Verify backup file exists
    if [[ ! -f "${backup_file}" ]]; then
        error "Backup file not found: ${backup_file}"
        return 1
    fi
    
    # Confirm restore
    warning "This will OVERWRITE the current database: ${DB_NAME}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "${confirm}" != "yes" ]]; then
        log "Restore cancelled by user"
        return 1
    fi
    
    export PGPASSWORD="${DB_PASSWORD}"
    
    # Drop and recreate database
    log "Dropping existing database..."
    psql \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --username="${DB_USER}" \
        --dbname="postgres" \
        --command="DROP DATABASE IF EXISTS ${DB_NAME};" || true
    
    log "Creating new database..."
    psql \
        --host="${DB_HOST}" \
        --port="${DB_PORT}" \
        --username="${DB_USER}" \
        --dbname="postgres" \
        --command="CREATE DATABASE ${DB_NAME};"
    
    # Restore backup
    log "Restoring database from backup..."
    if gunzip -c "${backup_file}" | \
        psql \
            --host="${DB_HOST}" \
            --port="${DB_PORT}" \
            --username="${DB_USER}" \
            --dbname="${DB_NAME}" \
            --quiet; then
        
        log "Database restored successfully!"
        unset PGPASSWORD
        return 0
    else
        error "Database restore failed!"
        unset PGPASSWORD
        return 1
    fi
}

###############################################################################
# Main Script
###############################################################################

main() {
    local backup_file=""
    local s3_key=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--file)
                backup_file="$2"
                shift 2
                ;;
            -s|--s3)
                s3_key="$2"
                shift 2
                ;;
            -l|--list)
                list_backups
                ;;
            -h|--help)
                usage
                ;;
            *)
                error "Unknown option: $1"
                usage
                ;;
        esac
    done
    
    # Validate input
    if [[ -z "${backup_file}" ]] && [[ -z "${s3_key}" ]]; then
        error "Please specify either --file or --s3"
        usage
    fi
    
    log "=== Database Restore Script Started ==="
    
    # Download from S3 if needed
    if [[ -n "${s3_key}" ]]; then
        backup_file="/tmp/restore_$(date +%s).sql.gz"
        if ! download_from_s3 "${s3_key}" "${backup_file}"; then
            exit 1
        fi
    fi
    
    # Perform restore
    if restore_database "${backup_file}"; then
        log "=== Database Restore Completed Successfully ==="
        
        # Cleanup temporary file
        if [[ -n "${s3_key}" ]]; then
            rm -f "${backup_file}"
        fi
        
        exit 0
    else
        error "=== Database Restore Failed ==="
        exit 1
    fi
}

# Run main function
main "$@"

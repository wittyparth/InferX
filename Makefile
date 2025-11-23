.PHONY: help build up down logs clean rebuild test

help:
	@echo "ML Platform Docker Commands"
	@echo "=============================="
	@echo ""
	@echo "Setup & Management:"
	@echo "  make build          - Build Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make down-clean     - Stop services and remove volumes (WARNING: deletes data)"
	@echo "  make rebuild        - Rebuild images and start"
	@echo ""
	@echo "Monitoring:"
	@echo "  make logs           - Show logs from all services"
	@echo "  make logs-backend   - Show backend logs"
	@echo "  make logs-frontend  - Show frontend logs"
	@echo "  make logs-db        - Show database logs"
	@echo ""
	@echo "Backend Commands:"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make migrate        - Run database migrations"
	@echo "  make test           - Run backend tests"
	@echo "  make lint           - Run backend linting"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make npm-install    - Install npm packages"
	@echo ""
	@echo "Database Commands:"
	@echo "  make shell-db       - Open PostgreSQL shell"
	@echo "  make backup-db      - Backup database"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean          - Remove containers and images"
	@echo "  make prune          - Prune unused Docker resources"
	@echo "  make env-setup      - Create .env from example"

build:
	@echo "Building Docker images..."
	docker-compose build

up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "✓ Services started"
	@echo ""
	@echo "Access:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/api/v1/docs"

down:
	@echo "Stopping services..."
	docker-compose down
	@echo "✓ Services stopped"

down-clean:
	@echo "WARNING: This will delete all volumes and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "✓ Services stopped and volumes removed"; \
	else \
		echo "✗ Cancelled"; \
	fi

rebuild:
	@echo "Rebuilding and starting..."
	docker-compose up -d --build
	@echo "✓ Services rebuilt and started"

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

shell-db:
	docker-compose exec postgres psql -U mluser -d ml_platform

migrate:
	@echo "Running database migrations..."
	docker-compose exec backend alembic upgrade head
	@echo "✓ Migrations completed"

test:
	@echo "Running backend tests..."
	docker-compose exec backend pytest -v

test-coverage:
	@echo "Running tests with coverage..."
	docker-compose exec backend pytest --cov=app --cov-report=html
	@echo "✓ Coverage report generated in htmlcov/"

lint:
	@echo "Linting backend code..."
	docker-compose exec backend flake8 app
	@echo "✓ Linting completed"

type-check:
	@echo "Type checking backend code..."
	docker-compose exec backend mypy app
	@echo "✓ Type checking completed"

npm-install:
	@echo "Installing npm packages..."
	docker-compose exec frontend pnpm install
	@echo "✓ Packages installed"

npm-add:
	@echo "Adding package: $(PKG)"
	docker-compose exec frontend pnpm add $(PKG)

backup-db:
	@echo "Backing up database..."
	docker-compose exec postgres pg_dump -U mluser ml_platform > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Backup created"

clean:
	@echo "Removing containers and images..."
	docker-compose down
	docker system prune -f
	@echo "✓ Cleanup completed"

prune:
	@echo "Pruning Docker resources..."
	docker system prune -a -f --volumes
	@echo "✓ Pruning completed"

env-setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ .env file created from .env.example"; \
	else \
		echo "✗ .env file already exists"; \
	fi

status:
	@echo "Service Status:"
	docker-compose ps

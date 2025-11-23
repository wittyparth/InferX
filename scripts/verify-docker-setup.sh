#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ML Platform Docker Setup Verification   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check Docker installation
echo -e "${YELLOW}1. Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓${NC} Docker installed: $DOCKER_VERSION"
else
    echo -e "${RED}✗${NC} Docker not found. Please install Docker."
    exit 1
fi

# Check Docker Compose installation
echo ""
echo -e "${YELLOW}2. Checking Docker Compose installation...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓${NC} Docker Compose installed: $COMPOSE_VERSION"
else
    echo -e "${RED}✗${NC} Docker Compose not found. Please install Docker Compose."
    exit 1
fi

# Check if Docker daemon is running
echo ""
echo -e "${YELLOW}3. Checking Docker daemon...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker daemon is running"
else
    echo -e "${RED}✗${NC} Docker daemon is not running. Please start Docker."
    exit 1
fi

# Check .env file
echo ""
echo -e "${YELLOW}4. Checking environment configuration...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${YELLOW}⚠${NC} .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} .env created from .env.example"
    else
        echo -e "${RED}✗${NC} .env.example not found"
    fi
fi

# Check required files
echo ""
echo -e "${YELLOW}5. Checking required files...${NC}"
REQUIRED_FILES=(
    "docker-compose.yml"
    "ML-Model-Serving-Platform/Dockerfile"
    "Frontend/Dockerfile"
    ".dockerignore"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file found"
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
done

# Check available ports
echo ""
echo -e "${YELLOW}6. Checking required ports...${NC}"
PORTS=(3000 8000 5432 6379)
for port in "${PORTS[@]}"; do
    if ! nc -z localhost $port 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Port $port is available"
    else
        echo -e "${YELLOW}⚠${NC} Port $port is in use"
    fi
done

# Check disk space
echo ""
echo -e "${YELLOW}7. Checking disk space...${NC}"
AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -gt 5242880 ]; then  # 5GB in KB
    echo -e "${GREEN}✓${NC} Sufficient disk space available"
else
    echo -e "${YELLOW}⚠${NC} Less than 5GB available. Consider freeing up space."
fi

# Check Docker resources
echo ""
echo -e "${YELLOW}8. Checking Docker resources...${NC}"
DOCKER_MEMORY=$(docker info --format='{{.MemTotal}}' 2>/dev/null)
if [ -n "$DOCKER_MEMORY" ]; then
    MEMORY_GB=$((DOCKER_MEMORY / 1024 / 1024 / 1024))
    if [ "$MEMORY_GB" -ge 4 ]; then
        echo -e "${GREEN}✓${NC} Docker has $MEMORY_GB GB memory (recommended: 4GB+)"
    else
        echo -e "${YELLOW}⚠${NC} Docker has $MEMORY_GB GB memory (recommended: 4GB+)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Could not determine Docker memory"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Setup Verification Complete       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Review .env file and update if needed"
echo "2. Run: docker-compose up -d"
echo "3. Access frontend at http://localhost:3000"
echo "4. Access backend at http://localhost:8000"
echo ""
echo -e "${YELLOW}For more help, see DOCKER_GUIDE.md${NC}"

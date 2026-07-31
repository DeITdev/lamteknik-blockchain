#!/bin/bash
# Docker Compose wrapper script for LAM Teknik Backend

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_NAME="lamtek"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_usage() {
    echo "Usage: $0 {up|down|restart|logs|status|clean|build}"
    echo ""
    echo "Commands:"
    echo "  up       - Start all services (MySQL, Redis, Kafka, IPFS, Besu, Backend)"
    echo "  down     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  logs     - View logs from all services"
    echo "  status   - Check status of all services"
    echo "  clean    - Remove all containers and volumes"
    echo "  build    - Build the backend image"
}

function check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed${NC}"
        exit 1
    fi
}

function print_info() {
    local message=$1
    echo -e "${GREEN}✓${NC} ${message}"
}

function print_warn() {
    local message=$1
    echo -e "${YELLOW}⚠${NC} ${message}"
}

function print_error() {
    local message=$1
    echo -e "${RED}✗${NC} ${message}"
}

function cmd_up() {
    check_docker
    print_info "Starting LAM Teknik services..."
    docker-compose -p "$PROJECT_NAME" up -d
    
    print_warn "Waiting for services to be healthy..."
    sleep 10
    
    print_info "Services started successfully!"
    echo ""
    echo "Service URLs:"
    echo "  Backend API:      http://localhost:3000"
    echo "  Swagger Docs:     http://localhost:3000/api/docs"
    echo "  MySQL:            localhost:3306 (user: lamtek_user, password: lamtek_password)"
    echo "  Redis:            localhost:6379"
    echo "  Kafka:            localhost:9092"
    echo "  IPFS API:         http://localhost:5001"
    echo "  IPFS Gateway:     http://localhost:8080"
    echo "  Besu RPC:         http://localhost:8545"
    echo ""
    echo "To view logs: $0 logs"
    echo "To stop services: $0 down"
}

function cmd_down() {
    check_docker
    print_info "Stopping LAM Teknik services..."
    docker-compose -p "$PROJECT_NAME" down
    print_info "Services stopped successfully!"
}

function cmd_restart() {
    cmd_down
    sleep 2
    cmd_up
}

function cmd_logs() {
    check_docker
    docker-compose -p "$PROJECT_NAME" logs -f --tail=100
}

function cmd_status() {
    check_docker
    docker-compose -p "$PROJECT_NAME" ps
}

function cmd_clean() {
    check_docker
    print_warn "This will remove all containers and volumes. Continue? (y/n)"
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        print_info "Cleaning up LAM Teknik services..."
        docker-compose -p "$PROJECT_NAME" down -v
        print_info "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

function cmd_build() {
    check_docker
    print_info "Building backend image..."
    docker-compose -p "$PROJECT_NAME" build backend
    print_info "Backend image built successfully!"
}

# Main script logic
if [ $# -eq 0 ]; then
    print_error "No command provided"
    echo ""
    print_usage
    exit 1
fi

case "$1" in
    up)
        cmd_up
        ;;
    down)
        cmd_down
        ;;
    restart)
        cmd_restart
        ;;
    logs)
        cmd_logs
        ;;
    status)
        cmd_status
        ;;
    clean)
        cmd_clean
        ;;
    build)
        cmd_build
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        print_usage
        exit 1
        ;;
esac

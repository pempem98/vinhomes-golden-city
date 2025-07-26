#!/bin/bash

# Real Estate App - Database Management Scripts for Linux/Mac
# Usage: ./scripts.sh [command]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Emojis for better UX
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
DATABASE="💾"
SIMULATE="🎬"
CLEAN="🧹"

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${PURPLE}  Real Estate Dashboard Scripts${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_usage() {
    echo -e "${YELLOW}Usage: ./scripts.sh [command]${NC}"
    echo ""
    echo "Commands:"
    echo -e "  ${GREEN}init${NC}            Initialize database with sample data (removes existing)"
    echo -e "  ${GREEN}init-safe${NC}       Initialize database safely (keeps existing data)"
    echo -e "  ${GREEN}simulate${NC}        Start live updates simulation (adds new apartments)"
    echo -e "  ${GREEN}simulate:status${NC} Start status change simulation (only changes status)"
    echo -e "  ${GREEN}clean${NC}           Clean database (remove all data)"
    echo -e "  ${GREEN}install${NC}         Install dependencies"
    echo -e "  ${GREEN}help${NC}            Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts.sh init             # Initialize database (destructive)"
    echo "  ./scripts.sh init-safe        # Initialize database (safe mode)"
    echo "  ./scripts.sh simulate         # Start full simulation"
    echo "  ./scripts.sh simulate:status  # Only change apartment status"
}

check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${CROSS} ${RED}Node.js is not installed!${NC}"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    echo -e "${CHECK} ${GREEN}Node.js found: $(node --version)${NC}"
}

check_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
        npm install
    fi
}

init_database() {
    print_header
    echo -e "${DATABASE} ${BLUE}Initializing Database${NC}"
    echo ""
    
    check_node
    check_dependencies
    
    echo -e "${YELLOW}Starting database initialization...${NC}"
    node init-database.js
    
    echo ""
    echo -e "${CHECK} ${GREEN}Database initialization complete!${NC}"
}

simulate_updates() {
    print_header
    echo -e "${SIMULATE} ${BLUE}Starting Live Updates Simulation${NC}"
    echo ""
    
    check_node
    check_dependencies
    
    echo -e "${YELLOW}Make sure the backend server is running on http://localhost:3001${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop simulation${NC}"
    echo ""
    
    node simulate-live-updates.js
}

simulate_status_changes() {
    print_header
    echo -e "${SIMULATE} ${BLUE}Starting Status Change Simulation${NC}"
    echo ""
    
    check_node
    check_dependencies
    
    echo -e "${YELLOW}Make sure the backend server is running on http://localhost:5000${NC}"
    echo -e "${GREEN}This simulation only changes apartment status (no apartments added/removed)${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop simulation${NC}"
    echo ""
    
    node simulate-status-changes.js
}

clean_database() {
    print_header
    echo -e "${CLEAN} ${BLUE}Cleaning Database${NC}"
    echo ""
    
    DB_PATH="../backend/database.sqlite"
    
    if [ -f "$DB_PATH" ]; then
        echo -e "${YELLOW}Removing database file...${NC}"
        rm -f "$DB_PATH"
        echo -e "${CHECK} ${GREEN}Database removed successfully${NC}"
    else
        echo -e "${YELLOW}No database file found${NC}"
    fi
    
    echo -e "${YELLOW}Run './scripts.sh init' to create a new database${NC}"
}

install_dependencies() {
    print_header
    echo -e "${ROCKET} ${BLUE}Installing Dependencies${NC}"
    echo ""
    
    check_node
    
    echo -e "${YELLOW}Installing script dependencies...${NC}"
    npm install
    
    echo ""
    echo -e "${CHECK} ${GREEN}Dependencies installed successfully!${NC}"
}

init_database_safe() {
    print_header
    echo -e "${DATABASE} ${BLUE}Safe Database Initialization${NC}"
    echo ""
    
    check_node
    check_dependencies
    
    echo -e "${YELLOW}Starting safe database initialization (non-destructive)...${NC}"
    node init-database-safe.js
    
    echo ""
    echo -e "${CHECK} ${GREEN}Safe database initialization complete!${NC}"
}

# Main script logic
case "${1:-help}" in
    "init")
        init_database
        ;;
    "init-safe")
        init_database_safe
        ;;
    "simulate")
        simulate_updates
        ;;
    "simulate:status")
        simulate_status_changes
        ;;
    "clean")
        clean_database
        ;;
    "install")
        install_dependencies
        ;;
    "help"|"--help"|"-h")
        print_header
        print_usage
        ;;
    *)
        print_header
        echo -e "${CROSS} ${RED}Unknown command: $1${NC}"
        echo ""
        print_usage
        exit 1
        ;;
esac

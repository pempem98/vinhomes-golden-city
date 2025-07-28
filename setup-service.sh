#!/bin/bash

echo "🐳 Setting up Vinhomes Golden City Dashboard with Docker..."
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider creating a non-root user for better security."
fi

# Update system packages
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System packages updated"

# Install Docker
if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    
    # Install Docker dependencies
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_status "Docker installed successfully"
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    
    # Download Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/bin/docker-compose
    
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose is already installed"
fi

# Verify installations
print_info "Verifying installations..."
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"

# Create application directory
APP_DIR="/home/lucasdo/workspace/vinhomes-golden-city"
print_info "Using application directory at $APP_DIR..."

if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found at $APP_DIR"
    exit 1
else
    print_status "Application directory found"
fi

# Setup environment files
print_info "Setting up environment configuration..."

if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating template..."
    print_warning "Please edit .env.production with your actual configuration:"
    print_warning "- Change WEBHOOK_SECRET to a secure random string"
    print_warning "- Update REACT_APP_BACKEND_URL with your domain/IP"
    print_warning "- Configure CORS_ORIGIN with your allowed domains"
else
    print_status "Environment file found"
fi

# Setup systemd service for auto-start
print_info "Setting up systemd service for auto-start..."

sudo tee /etc/systemd/system/vinhomes-golden-city.service > /dev/null <<EOF
[Unit]
Description=Vinhomes Golden City Dashboard
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker-compose up -d --build
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable vinhomes-golden-city.service
print_status "Systemd service configured"

# Setup firewall rules
print_info "Configuring firewall..."

if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 5000/tcp  # Backend (optional, for direct access)
    
    # Enable UFW if not already enabled
    sudo ufw --force enable
    print_status "Firewall configured"
else
    print_warning "UFW not found. Please configure firewall manually:"
    print_warning "- Allow port 22 (SSH)"
    print_warning "- Allow port 80 (HTTP)"
    print_warning "- Allow port 443 (HTTPS)"
fi

# Create backup script
print_info "Creating backup script..."

sudo tee /usr/local/bin/backup-vinhomes-golden-city-db.sh > /dev/null <<'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/vinhomes-golden-city"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DB="/home/lucasdo/workspace/vinhomes-golden-city/backend/database.sqlite"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
if [ -f "$SOURCE_DB" ]; then
    cp "$SOURCE_DB" "$BACKUP_DIR/database_backup_$DATE.sqlite"
    echo "Backup created: database_backup_$DATE.sqlite"
    
    # Keep only last 30 days of backups
    find $BACKUP_DIR -name "database_backup_*.sqlite" -mtime +30 -delete
else
    echo "Database file not found: $SOURCE_DB"
fi
EOF

sudo chmod +x /usr/local/bin/backup-vinhomes-golden-city-db.sh

# Setup cron job for daily backup
print_info "Setting up daily backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-vinhomes-golden-city-db.sh") | crontab -
print_status "Daily backup configured (2 AM)"

# Setup log rotation
print_info "Setting up log rotation..."

sudo tee /etc/logrotate.d/vinhomes-golden-city > /dev/null <<EOF
/home/lucasdo/workspace/vinhomes-golden-city/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /home/lucasdo/workspace/vinhomes-golden-city/docker-compose.yml restart > /dev/null 2>&1 || true
    endscript
}
EOF

print_status "Log rotation configured"

# Print final instructions
echo ""
print_status "Service Setup completed successfully!"
echo ""
print_info "Next steps:"
echo "1. Your project files are already at $APP_DIR"
echo "2. Edit .env.production with your configuration:"
echo "   - WEBHOOK_SECRET (use a strong random string)"
echo "   - REACT_APP_BACKEND_URL (your domain or server IP)"
echo "   - CORS_ORIGIN (allowed domains)"
echo "3. Build and start the application:"
echo "   cd $APP_DIR"
echo "   docker-compose up -d"
echo "4. Update your Google Apps Script with the new webhook URL"
echo "5. Configure SSL certificate (recommended for production)"
echo ""
print_warning "Security Recommendations:"
echo "- Change default passwords and secrets"
echo "- Configure SSL/TLS certificates"
echo "- Setup monitoring and alerting"
echo "- Regular security updates"
echo "- Database backups (automated daily at 2 AM)"
echo ""
print_info "Useful commands:"
echo "- Check status: docker-compose ps"
echo "- View logs: docker-compose logs -f"
echo "- Restart: docker-compose restart"
echo "- Stop: docker-compose down"
echo "- Update: git pull && docker-compose up -d --build"
echo ""
print_status "Setup complete! 🎉"

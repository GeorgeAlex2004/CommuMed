#!/bin/bash
# Setup script for Ollama on Oracle Cloud Free Tier
# Run this script after connecting via SSH to your Oracle Cloud instance

set -e

echo "=========================================="
echo "Ollama Setup Script for Oracle Cloud"
echo "=========================================="
echo ""

# Check if running as opc user
if [ "$USER" != "opc" ]; then
    echo "⚠️  Warning: This script should be run as 'opc' user"
    echo "   Current user: $USER"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Step 1: Updating system packages..."
sudo yum update -y

echo ""
echo "📥 Step 2: Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

echo ""
echo "✅ Step 3: Verifying Ollama installation..."
ollama --version

echo ""
echo "🔧 Step 4: Setting up environment..."
export OLLAMA_HOST=0.0.0.0:11434

echo ""
echo "🚀 Step 5: Starting Ollama (test run)..."
ollama serve &
OLLAMA_PID=$!
sleep 5

echo ""
echo "🧪 Step 6: Testing Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running!"
else
    echo "❌ Ollama test failed"
    kill $OLLAMA_PID 2>/dev/null || true
    exit 1
fi

# Stop test instance
kill $OLLAMA_PID 2>/dev/null || true
sleep 2

echo ""
echo "📚 Step 7: Pulling required models..."
echo "   This will take 10-15 minutes..."
echo "   Pulling llama3.2..."
ollama pull llama3.2

echo ""
echo "   Pulling nomic-embed-text..."
ollama pull nomic-embed-text

echo ""
echo "✅ Step 8: Verifying models..."
ollama list

echo ""
echo "⚙️  Step 9: Creating systemd service..."
sudo tee /etc/systemd/system/ollama.service > /dev/null <<EOF
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=opc
Environment="OLLAMA_HOST=0.0.0.0:11434"
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "🔄 Step 10: Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama

echo ""
echo "⏳ Waiting for service to start..."
sleep 5

echo ""
echo "📊 Step 11: Checking service status..."
sudo systemctl status ollama --no-pager

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "1. Get your public IP from Oracle Cloud dashboard"
echo "2. Test from your computer:"
echo "   curl http://YOUR_PUBLIC_IP:11434/api/tags"
echo ""
echo "3. Add to Vercel environment variables:"
echo "   OLLAMA_BASE_URL = http://YOUR_PUBLIC_IP:11434"
echo "   EMBEDDING_MODEL = nomic-embed-text"
echo "   OLLAMA_MODEL = llama3.2"
echo ""
echo "🔍 Useful commands:"
echo "   sudo systemctl status ollama    # Check status"
echo "   sudo journalctl -u ollama -f    # View logs"
echo "   ollama list                     # List models"
echo ""
echo "=========================================="


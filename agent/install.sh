#!/bin/bash
# xSignage Agent Installer
# Usage: curl -fsSL https://signage.xshield.com.tr/install.sh | bash -s -- --device-id <id> --api-key <key>
set -e

DEVICE_ID=""
API_KEY=""
SERVER="wss://signage.xshield.com.tr"
AGENT_DIR="/opt/xsignage"
SERVICE_FILE="/etc/systemd/system/xsignage.service"

while [[ $# -gt 0 ]]; do
  case $1 in
    --device-id) DEVICE_ID="$2"; shift 2 ;;
    --api-key)   API_KEY="$2";   shift 2 ;;
    --server)    SERVER="$2";    shift 2 ;;
    *) shift ;;
  esac
done

if [[ -z "$DEVICE_ID" || -z "$API_KEY" ]]; then
  echo "Usage: install.sh --device-id <id> --api-key <key> [--server wss://...]"
  exit 1
fi

echo "==> Installing xSignage Agent..."
apt-get update -qq
apt-get install -y -qq python3 python3-pip chromium-browser xdotool x11-utils

mkdir -p "$AGENT_DIR"
pip3 install -q websockets httpx aiohttp aiofiles

# Download agent
curl -fsSL "${SERVER/wss:\/\//https:\/\/}/static/agent.py" -o "$AGENT_DIR/agent.py" 2>/dev/null || \
  cp "$(dirname "$0")/agent.py" "$AGENT_DIR/agent.py"

# Write environment config
cat > "$AGENT_DIR/.env" <<EOF
SIGNAGE_SERVER=$SERVER
SIGNAGE_DEVICE_ID=$DEVICE_ID
SIGNAGE_API_KEY=$API_KEY
DISPLAY=:0
EOF

# Systemd service
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=xSignage Display Agent
After=network-online.target graphical.target
Wants=network-online.target

[Service]
Type=simple
User=pi
EnvironmentFile=$AGENT_DIR/.env
ExecStart=/usr/bin/python3 $AGENT_DIR/agent.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical.target
EOF

systemctl daemon-reload
systemctl enable xsignage
systemctl start  xsignage

echo ""
echo "✓ xSignage Agent installed and started."
echo "  Status : systemctl status xsignage"
echo "  Logs   : journalctl -u xsignage -f"

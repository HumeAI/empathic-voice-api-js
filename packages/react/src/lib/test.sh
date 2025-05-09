#!/bin/bash

echo "Blocking traffic to WebSocket IPs..."
echo "block drop quick from any to 104.18.5.93" | sudo tee /etc/pf-block-ws.conf > /dev/null
echo "block drop quick from any to 104.18.4.93" | sudo tee -a /etc/pf-block-ws.conf > /dev/null

echo "Applying pf rules..."
sudo pfctl -f /etc/pf-block-ws.conf
sudo pfctl -e

WAIT_TIME=21
echo "Simulating connection drop for $WAIT_TIME seconds..."
sleep $WAIT_TIME

echo "Restoring network rules..."
# sudo pfctl -f /etc/pf.conf
# sudo pfctl -d

# echo "Network restored."

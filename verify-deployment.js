#!/usr/bin/env node

// Simple deployment verification script
const https = require('https');
const WebSocket = require('ws');

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const HEALTH_URL = WEBSOCKET_URL.replace('ws://', 'http://').replace('wss://', 'https://') + '/health';

console.log('🔍 Verifying deployment...\n');

// Test 1: Health check
console.log('1. Testing health endpoint...');
const healthUrl = new URL(HEALTH_URL);
const options = {
  hostname: healthUrl.hostname,
  port: healthUrl.port || (healthUrl.protocol === 'https:' ? 443 : 80),
  path: healthUrl.pathname,
  method: 'GET'
};

const req = (healthUrl.protocol === 'https:' ? https : require('http')).request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Health check passed');
      console.log('   Response:', JSON.parse(data));
    } else {
      console.log('❌ Health check failed:', res.statusCode);
    }
    
    // Test 2: WebSocket connection
    console.log('\n2. Testing WebSocket connection...');
    const ws = new WebSocket(WEBSOCKET_URL);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection successful');
      ws.close();
    });
    
    ws.on('error', (error) => {
      console.log('❌ WebSocket connection failed:', error.message);
    });
    
    ws.on('close', () => {
      console.log('\n🎉 Deployment verification complete!');
    });
  });
});

req.on('error', (error) => {
  console.log('❌ Health check failed:', error.message);
  console.log('\n⚠️  Skipping WebSocket test due to health check failure');
});

req.end();
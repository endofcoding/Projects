#!/bin/bash

# SafePath Local Build Pipeline
# This script runs the full suite of checks and builds the app.

set -e # Exit immediately if a command exits with a non-zero status.

echo "🚀 Starting SafePath Build Pipeline..."

echo "📦 Installing dependencies..."
npm install

echo "🔍 Running Linter..."
npm run lint

echo "🧪 Running Tests..."
npm run test

echo "🛡️ Running Security Scan..."
npm run security-scan

echo "🏗️ Building Application..."
npm run build

echo "✅ Pipeline completed successfully!"

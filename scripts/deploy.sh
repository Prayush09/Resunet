#!/bin/bash

# Exit on error
set -e

# Navigate to project directory
cd Resunet

# Pull latest changes from production branch
git pull origin production

# Install dependencies
npm ci

# Build the application
npm run build

# Restart or start the PM2 process
pm2 restart nextjs-app || pm2 start npm --name "nextjs-app" -- start

# Log the deployment
echo "Deployment completed successfully at $(date)" >> Resunet/deploy.log

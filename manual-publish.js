#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const packagePath = path.join(__dirname, 'packages', 'shared');

console.log('🚀 Manual publish to GitHub Packages...\n');

try {
  // Navigate to package directory and publish directly
  process.chdir(packagePath);
  
  // Build first
  execSync('tsc', { stdio: 'inherit' });
  
  // Set authentication
  execSync(`npm config set //npm.pkg.github.com/:_authToken ${process.env.GITHUB_TOKEN}`, { stdio: 'pipe' });
  
  // Publish with explicit registry
  execSync('npm publish --registry=https://npm.pkg.github.com', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN 
    }
  });
  
  console.log('\n✅ Successfully published @system/shared!');
  
} catch (error) {
  console.log('❌ Publish failed:', error.message);
}
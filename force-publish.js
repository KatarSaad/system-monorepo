#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const packagePath = path.join(__dirname, 'packages', 'shared');

console.log('🚀 Force publishing @system/shared...\n');

try {
  process.chdir(packagePath);
  
  // Clear npm cache
  execSync('npm cache clean --force', { stdio: 'pipe' });
  
  // Set auth token directly
  execSync(`npm config set //npm.pkg.github.com/:_authToken ${process.env.GITHUB_TOKEN}`, { stdio: 'pipe' });
  
  // Build
  execSync('npm run build', { stdio: 'inherit' });
  
  // Try publishing with verbose output
  execSync('npm publish --registry=https://npm.pkg.github.com --verbose', { 
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN,
      NPM_TOKEN: process.env.GITHUB_TOKEN
    }
  });
  
  console.log('\n✅ Successfully published!');
  
} catch (error) {
  console.log('\n❌ Still failing. Try publishing to NPM instead:');
  console.log('1. Run: npm login');
  console.log('2. Run: npm publish --access public');
}
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages');
const PUBLISH_ORDER = [
  'shared', 'core', 'monitoring', 'infrastructure', 'security',
  'validation', 'logging', 'audit', 'events', 'rate-limiting', 
  'search', 'health', 'backup', 'config', 'feature-flags', 
  'file-storage', 'queue', 'notifications', 'testing', 'system-module'
];

function publishPackage(packageName) {
  const packagePath = path.join(PACKAGES_DIR, packageName);
  
  if (!fs.existsSync(packagePath)) {
    console.log(`⚠️  Package ${packageName} not found`);
    return false;
  }
  
  console.log(`📦 Publishing @system/${packageName} to GitHub Packages...`);
  
  try {
    // Build first
    execSync('tsc', { cwd: packagePath, stdio: 'pipe' });
    
    // Publish to GitHub Packages
    execSync('npm publish --registry=https://npm.pkg.github.com', { 
      cwd: packagePath, 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN 
      }
    });
    
    console.log(`✅ Published @system/${packageName}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed @system/${packageName}`);
    return false;
  }
}

// Check for GitHub token
if (!process.env.GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable not set');
  console.log('Set it with: set GITHUB_TOKEN=your_github_token_here');
  process.exit(1);
}

console.log('🚀 Publishing to GitHub Packages...\n');

let published = 0;
for (const packageName of PUBLISH_ORDER) {
  if (publishPackage(packageName)) {
    published++;
  }
}

console.log(`\n🎉 Published ${published}/${PUBLISH_ORDER.length} packages to GitHub!`);
console.log('🌐 Packages available at: https://github.com/KatarSaad?tab=packages');
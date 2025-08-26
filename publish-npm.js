#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages');
const PUBLISH_ORDER = ['shared', 'core', 'monitoring'];

function publishToNpm(packageName) {
  const packagePath = path.join(PACKAGES_DIR, packageName);
  
  console.log(`📦 Publishing @system/${packageName} to NPM...`);
  
  try {
    // Build
    execSync('npm run build', { cwd: packagePath, stdio: 'pipe' });
    
    // Publish to NPM (public registry)
    execSync('npm publish --access public', { 
      cwd: packagePath, 
      stdio: 'inherit'
    });
    
    console.log(`✅ Published @system/${packageName} to NPM`);
    return true;
  } catch (error) {
    console.log(`❌ Failed @system/${packageName}:`, error.message);
    return false;
  }
}

console.log('🚀 Publishing to NPM Registry...\n');

let published = 0;
for (const packageName of PUBLISH_ORDER) {
  if (publishToNpm(packageName)) {
    published++;
  }
}

console.log(`\n🎉 Published ${published}/${PUBLISH_ORDER.length} packages to NPM!`);
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages');
const REGISTRY_URL = 'http://localhost:4873';

// Skip auth check and publish directly
const PUBLISH_ORDER = [
  'shared', 'core', 'monitoring', 'security', 'infrastructure',
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
  
  console.log(`📦 Publishing @system/${packageName}...`);
  
  try {
    // Build and publish without auth check
    execSync('npm run build', { cwd: packagePath, stdio: 'pipe' });
    execSync(`npm publish --registry=${REGISTRY_URL} --force`, { 
      cwd: packagePath, 
      stdio: 'pipe' 
    });
    
    console.log(`✅ Published @system/${packageName}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed ${packageName}: ${error.message.split('\n')[0]}`);
    return false;
  }
}

console.log('🚀 Quick publishing to Verdaccio...\n');

let published = 0;
for (const packageName of PUBLISH_ORDER) {
  if (publishPackage(packageName)) {
    published++;
  }
}

console.log(`\n🎉 Published ${published}/${PUBLISH_ORDER.length} packages!`);
console.log(`🌐 View at: ${REGISTRY_URL}`);
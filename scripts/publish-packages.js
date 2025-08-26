#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packages = [
  'core', 'infrastructure', 'security', 'monitoring', 'validation',
  'audit', 'events', 'rate-limiting', 'search', 'health', 'backup',
  'config', 'feature-flags', 'file-storage', 'queue', 'notifications',
  'logging', 'shared', 'testing'
];

async function publishPackages() {
  console.log('🚀 Starting package publication...\n');

  // Build all packages first
  console.log('📦 Building all packages...');
  execSync('pnpm build:packages', { stdio: 'inherit' });

  // Publish each package
  for (const pkg of packages) {
    const packagePath = path.join(__dirname, '..', 'packages', pkg);
    
    if (!fs.existsSync(packagePath)) {
      console.log(`⚠️  Package ${pkg} not found, skipping...`);
      continue;
    }

    try {
      console.log(`\n📤 Publishing @system/${pkg}...`);
      execSync(`cd ${packagePath} && pnpm publish --access public`, { stdio: 'inherit' });
      console.log(`✅ @system/${pkg} published successfully`);
    } catch (error) {
      console.error(`❌ Failed to publish @system/${pkg}:`, error.message);
    }
  }

  console.log('\n🎉 Package publication completed!');
}

publishPackages().catch(console.error);
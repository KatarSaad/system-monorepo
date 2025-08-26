#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const packagePath = path.join(__dirname, 'packages', 'shared');

console.log('🧪 Testing GitHub Packages publish with @system/shared...\n');

try {
  // Set GitHub registry for @system scope
  execSync('npm config set @system:registry https://npm.pkg.github.com', { cwd: packagePath, stdio: 'pipe' });
  execSync('npm config set //npm.pkg.github.com/:_authToken ${GITHUB_TOKEN}', { 
    cwd: packagePath, 
    stdio: 'pipe',
    env: { ...process.env, GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  });
  
  // Build
  execSync('tsc', { cwd: packagePath, stdio: 'pipe' });
  
  // Test publish (dry run first)
  console.log('📋 Dry run publish...');
  execSync('npm publish --dry-run', { 
    cwd: packagePath, 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN 
    }
  });
  
  console.log('\n✅ Dry run successful! Ready to publish for real.');
  console.log('Run: npm publish (without --dry-run) to actually publish');
  
} catch (error) {
  console.log('❌ Test failed:', error.message);
}
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up GitHub Packages authentication...\n');

// Create .npmrc in user home directory
const homeDir = require('os').homedir();
const npmrcPath = path.join(homeDir, '.npmrc');

const npmrcContent = `@system:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${process.env.GITHUB_TOKEN}`;

try {
  // Backup existing .npmrc if it exists
  if (fs.existsSync(npmrcPath)) {
    fs.copyFileSync(npmrcPath, `${npmrcPath}.backup`);
    console.log('📋 Backed up existing .npmrc');
  }
  
  // Write new .npmrc
  fs.writeFileSync(npmrcPath, npmrcContent);
  console.log('✅ Created ~/.npmrc with GitHub Packages auth');
  
  // Test authentication
  console.log('\n🧪 Testing authentication...');
  const whoami = execSync('npm whoami --registry=https://npm.pkg.github.com', { 
    encoding: 'utf8',
    env: { ...process.env, GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  }).trim();
  
  console.log(`✅ Authenticated as: ${whoami}`);
  
  // Try to publish one package
  const packagePath = path.join(__dirname, 'packages', 'shared');
  console.log('\n📦 Attempting to publish @system/shared...');
  
  execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
  execSync('npm publish', { 
    cwd: packagePath, 
    stdio: 'inherit',
    env: { ...process.env, GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  });
  
  console.log('🎉 Successfully published @system/shared!');
  
} catch (error) {
  console.log('❌ Setup failed:', error.message);
  
  // Restore backup if it exists
  if (fs.existsSync(`${npmrcPath}.backup`)) {
    fs.copyFileSync(`${npmrcPath}.backup`, npmrcPath);
    console.log('📋 Restored original .npmrc');
  }
}
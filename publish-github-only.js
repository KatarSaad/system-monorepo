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
  
  console.log(`📦 Publishing @katarsaad/${packageName} to GitHub Packages...`);
  
  try {
    // Remove prepublishOnly script temporarily
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const originalScripts = { ...packageJson.scripts };
    delete packageJson.scripts.prepublishOnly;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Build manually
    execSync('tsc', { cwd: packagePath, stdio: 'pipe' });
    
    // Set GitHub registry for @katarsaad scope
    execSync('npm config set @katarsaad:registry https://npm.pkg.github.com', { cwd: packagePath, stdio: 'pipe' });
    execSync('npm config set //npm.pkg.github.com/:_authToken ${GITHUB_TOKEN}', { 
      cwd: packagePath, 
      stdio: 'pipe',
      env: { ...process.env, GITHUB_TOKEN: process.env.GITHUB_TOKEN }
    });
    execSync('npm publish', { 
      cwd: packagePath, 
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_AUTH_TOKEN: process.env.GITHUB_TOKEN 
      }
    });
    
    // Restore original scripts
    packageJson.scripts = originalScripts;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    console.log(`✅ Published @katarsaad/${packageName}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed @katarsaad/${packageName}`);
    return false;
  }
}

// Check for GitHub token
if (!process.env.GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable not set');
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
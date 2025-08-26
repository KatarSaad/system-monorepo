#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages');
const CORRECT_REPO_URL = 'https://github.com/KatarSaad/system-monorepo.git';

function updatePackageJson(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packageName = path.basename(packagePath);
  
  // Update repository URL
  packageJson.repository = {
    type: 'git',
    url: CORRECT_REPO_URL,
    directory: `packages/${packageName}`
  };
  
  // Update publishConfig
  packageJson.publishConfig = {
    registry: 'https://npm.pkg.github.com',
    access: 'restricted'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Updated ${packageName}/package.json`);
  return true;
}

// Get all package directories
const packages = fs.readdirSync(PACKAGES_DIR)
  .filter(dir => fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory());

console.log('🔧 Fixing repository URLs in package.json files...\n');

let updated = 0;
for (const packageName of packages) {
  const packagePath = path.join(PACKAGES_DIR, packageName);
  if (updatePackageJson(packagePath)) {
    updated++;
  }
}

console.log(`\n🎉 Updated ${updated} package.json files!`);
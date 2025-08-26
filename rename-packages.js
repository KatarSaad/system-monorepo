#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages');

function updatePackageName(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Skipping ${path.basename(packagePath)} - no package.json`);
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const packageName = path.basename(packagePath);
  
  // Change from @system to @katarsaad
  packageJson.name = `@katarsaad/${packageName}`;
  
  // Update dependencies
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (dep.startsWith('@system/')) {
        const newDep = dep.replace('@system/', '@katarsaad/');
        packageJson.dependencies[newDep] = packageJson.dependencies[dep];
        delete packageJson.dependencies[dep];
      }
    });
  }
  
  // Update for GitHub Packages with your username
  packageJson.publishConfig = {
    registry: 'https://npm.pkg.github.com',
    access: 'restricted'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ Updated ${packageName} to @katarsaad/${packageName}`);
}

const packages = fs.readdirSync(PACKAGES_DIR)
  .filter(dir => fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory());

console.log('🔄 Renaming packages from @system to @katarsaad...\n');

packages.forEach(packageName => {
  const packagePath = path.join(PACKAGES_DIR, packageName);
  updatePackageName(packagePath);
});

console.log(`\n🎉 Renamed ${packages.length} packages!`);
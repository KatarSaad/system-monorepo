#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '..', 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(pkg => {
  const packageJsonPath = path.join(packagesDir, pkg, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Fix dependencies
    if (packageJson.dependencies) {
      Object.keys(packageJson.dependencies).forEach(dep => {
        if (dep.startsWith('@system/')) {
          packageJson.dependencies[dep] = 'workspace:*';
        }
      });
    }
    
    // Fix devDependencies
    if (packageJson.devDependencies) {
      Object.keys(packageJson.devDependencies).forEach(dep => {
        if (dep.startsWith('@system/')) {
          packageJson.devDependencies[dep] = 'workspace:*';
        }
      });
    }
    
    // Add publish config
    packageJson.publishConfig = { access: 'public' };
    packageJson.files = ['dist', 'README.md', 'CHANGELOG.md'];
    
    if (!packageJson.scripts) packageJson.scripts = {};
    packageJson.scripts.prepublishOnly = 'pnpm build';
    packageJson.scripts.clean = 'rm -rf dist';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Fixed ${pkg}`);
  }
});

console.log('🎉 All workspace dependencies fixed!');
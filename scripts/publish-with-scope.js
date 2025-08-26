#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packages = ['core', 'monitoring', 'security', 'health'];

packages.forEach(pkg => {
  const packagePath = path.join(__dirname, '..', 'packages', pkg);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const originalName = packageJson.name;
    
    // Change name for publishing
    packageJson.name = `@katarsaad/system-${pkg}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    try {
      console.log(`📤 Publishing ${packageJson.name}...`);
      execSync(`cd ${packagePath} && pnpm build && pnpm publish --access public --no-git-checks`, { stdio: 'inherit' });
      console.log(`✅ Published ${packageJson.name}`);
    } catch (error) {
      console.error(`❌ Failed to publish ${packageJson.name}`);
    }
    
    // Restore original name
    packageJson.name = originalName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
});

console.log('🎉 Publishing completed!');
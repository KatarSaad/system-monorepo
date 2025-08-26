const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, 'packages');
const packages = fs.readdirSync(packagesDir);

packages.forEach(packageName => {
  const packageJsonPath = path.join(packagesDir, packageName, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove GitHub-specific configs
    delete packageJson.publishConfig;
    delete packageJson.repository;
    
    // Clean up files array
    packageJson.files = ['dist'];
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Fixed ${packageName}`);
  }
});

console.log('🎉 All packages fixed for npm publishing');
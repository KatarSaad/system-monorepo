const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const corePackages = ['core', 'shared', 'monitoring'];

function updateVersion(packageName) {
  const packagePath = path.join(__dirname, 'packages', packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update version to 1.0.1
    packageJson.version = '1.0.1';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated ${packageName} to v1.0.1`);
    return true;
  }
  return false;
}

function publishPackage(packageName) {
  const packagePath = path.join(__dirname, 'packages', packageName);
  
  try {
    console.log(`📦 Publishing ${packageName}...`);
    execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
    execSync('npm publish --access public', { cwd: packagePath, stdio: 'inherit' });
    console.log(`✅ ${packageName} published\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${packageName} failed: ${error.message}\n`);
    return false;
  }
}

console.log('🚀 Publishing core packages...\n');

// Update versions first
corePackages.forEach(updateVersion);

// Then publish
let success = 0;
for (const pkg of corePackages) {
  if (publishPackage(pkg)) success++;
}

console.log(`📊 Published ${success}/${corePackages.length} core packages`);

if (success === corePackages.length) {
  console.log('\n✅ Core packages published! Now you can publish the rest.');
}
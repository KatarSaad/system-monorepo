const { execSync } = require('child_process');
const path = require('path');

const publishOrder = [
  'core', 'shared', 'monitoring',
  'infrastructure', 
  'security', 'validation', 'events', 'config', 'logging',
  'audit', 'backup', 'health', 'file-storage', 'notifications',
  'queue', 'rate-limiting', 'feature-flags', 'search', 'testing'
];

function publishPackage(packageName) {
  const packagePath = path.join(__dirname, 'packages', packageName);
  
  try {
    console.log(`📦 Publishing ${packageName}...`);
    execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
    execSync('npm publish --access public', { cwd: packagePath, stdio: 'inherit' });
    console.log(`✅ ${packageName} published\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${packageName} failed\n`);
    return false;
  }
}

console.log('🚀 Publishing to npm...\n');

let success = 0;
for (const pkg of publishOrder) {
  if (publishPackage(pkg)) success++;
}

console.log(`📊 Published ${success}/${publishOrder.length} packages`);
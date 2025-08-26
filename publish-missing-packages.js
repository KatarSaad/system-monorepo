const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Packages that need to be published in dependency order
const publishOrder = [
  'core',
  'shared', 
  'infrastructure',
  'monitoring',
  'security',
  'validation',
  'audit',
  'events',
  'config',
  'logging',
  'backup',
  'health',
  'file-storage',
  'notifications',
  'queue',
  'rate-limiting',
  'feature-flags',
  'search',
  'system-module',
  'testing'
];

async function publishPackage(packageName) {
  const packagePath = path.join(__dirname, 'packages', packageName);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`❌ Package ${packageName} not found`);
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log(`📦 Publishing ${packageJson.name}@${packageJson.version}`);

  try {
    // Build package
    execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
    
    // Publish package
    execSync('npm publish', { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`✅ Successfully published ${packageJson.name}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to publish ${packageName}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Publishing missing packages in dependency order...\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const packageName of publishOrder) {
    const success = await publishPackage(packageName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Empty line for readability
  }

  console.log(`📊 Summary: ${successCount} published, ${failCount} failed`);
}

main().catch(console.error);
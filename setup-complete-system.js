const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up complete system...\n');

// Core packages that can be published first
const corePackages = ['core', 'shared', 'monitoring'];

// Infrastructure package
const infraPackage = ['infrastructure'];

// Dependent packages
const dependentPackages = [
  'security', 'validation', 'audit', 'events', 'config', 'logging',
  'backup', 'health', 'file-storage', 'notifications', 'queue',
  'rate-limiting', 'feature-flags', 'search', 'testing'
];

function buildAndPublish(packageName) {
  const packagePath = path.join(__dirname, 'packages', packageName);
  
  try {
    console.log(`📦 Building ${packageName}...`);
    execSync('npm run build', { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`🚀 Publishing ${packageName}...`);
    execSync('npm publish', { cwd: packagePath, stdio: 'inherit' });
    
    console.log(`✅ ${packageName} published successfully\n`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to publish ${packageName}: ${error.message}\n`);
    return false;
  }
}

async function setupSystem() {
  console.log('1️⃣ Publishing core packages...');
  for (const pkg of corePackages) {
    buildAndPublish(pkg);
  }
  
  console.log('2️⃣ Publishing infrastructure...');
  buildAndPublish('infrastructure');
  
  console.log('3️⃣ Publishing dependent packages...');
  for (const pkg of dependentPackages) {
    buildAndPublish(pkg);
  }
  
  console.log('4️⃣ Setting up API service...');
  const apiPath = path.join(__dirname, 'services', 'api');
  
  try {
    console.log('Installing API dependencies...');
    execSync('npm install', { cwd: apiPath, stdio: 'inherit' });
    
    console.log('Generating Prisma client...');
    execSync('npm run db:generate', { cwd: apiPath, stdio: 'inherit' });
    
    console.log('Building API service...');
    execSync('npm run build', { cwd: apiPath, stdio: 'inherit' });
    
    console.log('✅ API service ready');
  } catch (error) {
    console.log(`❌ API setup failed: ${error.message}`);
  }
  
  console.log('\n🎉 System setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Set GITHUB_TOKEN environment variable');
  console.log('2. Run: npm run start:dev (in services/api)');
  console.log('3. Test ticket system endpoints');
}

setupSystem();
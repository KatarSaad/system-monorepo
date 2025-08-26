const { execSync } = require('child_process');

console.log('🔐 Setting up NPM authentication for GitHub packages...\n');

try {
  // Check if already authenticated
  try {
    execSync('npm whoami --registry=https://npm.pkg.github.com', { stdio: 'pipe' });
    console.log('✅ Already authenticated with GitHub packages');
  } catch {
    console.log('❌ Not authenticated. Please run:');
    console.log('npm login --scope=@katarsaad --registry=https://npm.pkg.github.com');
    console.log('\nOr set up .npmrc with your GitHub token:');
    console.log('//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN');
    console.log('@katarsaad:registry=https://npm.pkg.github.com');
  }
} catch (error) {
  console.error('Error checking authentication:', error.message);
}

console.log('\n📦 To publish packages, ensure you have:');
console.log('1. GitHub personal access token with packages:write permission');
console.log('2. Proper .npmrc configuration');
console.log('3. Repository access permissions');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packages = [
  'core', 'shared', 'monitoring', 'infrastructure', 'security', 
  'validation', 'events', 'config', 'logging', 'audit', 'backup',
  'health', 'file-storage', 'notifications', 'queue', 'rate-limiting',
  'feature-flags', 'search', 'testing', 'system-module'
];

console.log('🔍 Checking published packages...\n');

const notPublished = [];
const published = [];

for (const pkg of packages) {
  try {
    const result = execSync(`npm view @katarsaad/${pkg} version`, { encoding: 'utf8', stdio: 'pipe' });
    if (result.trim()) {
      published.push(`@katarsaad/${pkg}@${result.trim()}`);
    }
  } catch (error) {
    notPublished.push(`@katarsaad/${pkg}`);
  }
}

console.log('✅ Published packages:');
published.forEach(pkg => console.log(`  ${pkg}`));

console.log('\n❌ Not published packages:');
notPublished.forEach(pkg => console.log(`  ${pkg}`));

console.log(`\n📊 Summary: ${published.length} published, ${notPublished.length} not published`);

if (notPublished.length > 0) {
  console.log('\n🚀 To publish missing packages, run:');
  notPublished.forEach(pkg => {
    const pkgName = pkg.replace('@katarsaad/', '');
    console.log(`cd packages/${pkgName} && npm run build && npm publish --access public`);
  });
}
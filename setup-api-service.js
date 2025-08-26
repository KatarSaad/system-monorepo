const { execSync } = require('child_process');
const path = require('path');

const apiPath = path.join(__dirname, 'services', 'api');

console.log('🚀 Setting up API service...\n');

try {
  console.log('1️⃣ Installing dependencies...');
  execSync('npm install', { cwd: apiPath, stdio: 'inherit' });
  
  console.log('\n2️⃣ Generating Prisma client...');
  execSync('npm run db:generate', { cwd: apiPath, stdio: 'inherit' });
  
  console.log('\n3️⃣ Building API service...');
  execSync('npm run build', { cwd: apiPath, stdio: 'inherit' });
  
  console.log('\n✅ API service ready!');
  console.log('\n🎯 Next steps:');
  console.log('1. cd services/api');
  console.log('2. npm run start:dev');
  console.log('3. Visit http://localhost:3000/api (Swagger docs)');
  console.log('4. Test ticket endpoints at /tickets');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
}
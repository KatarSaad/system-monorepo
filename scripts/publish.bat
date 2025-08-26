@echo off
echo 🚀 Publishing @system packages to npm...

echo 📦 Building all packages...
pnpm build:packages

echo 📤 Publishing packages...
pnpm --filter "./packages/*" publish --access public

echo 🎉 All packages published successfully!
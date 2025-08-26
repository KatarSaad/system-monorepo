@echo off
echo Creating GitHub repository...
echo Go to: https://github.com/new
echo Repository name: system-monorepo
echo Make it PUBLIC
pause

echo Pushing to GitHub...
git remote set-url origin https://github.com/katarsaad/system-monorepo.git
git add .
git commit -m "Updated for GitHub Packages"
git push -u origin main

echo Setup complete!
pause
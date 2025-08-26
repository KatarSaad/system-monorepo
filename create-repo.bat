@echo off
echo Creating GitHub repository via API...

set /p TOKEN="Enter your GitHub token: "

curl -k -X POST ^
  -H "Authorization: token %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"system-monorepo\",\"public\":true,\"description\":\"Enterprise System Monorepo with 20 packages\"}" ^
  https://api.github.com/user/repos

echo.
echo Repository created! Now pushing...

git remote set-url origin https://github.com/KatarSaad/system-monorepo.git
git push -u origin main

echo.
echo Done! Repository available at: https://github.com/KatarSaad/system-monorepo
pause
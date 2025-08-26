@echo off

cd packages\audit
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/audit"
git remote add origin https://github.com/katarsaad/system-audit.git
git push -u origin main
cd ....


cd packages\backup
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/backup"
git remote add origin https://github.com/katarsaad/system-backup.git
git push -u origin main
cd ....


cd packages\config
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/config"
git remote add origin https://github.com/katarsaad/system-config.git
git push -u origin main
cd ....


cd packages\core
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/core"
git remote add origin https://github.com/katarsaad/system-core.git
git push -u origin main
cd ....


cd packages\events
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/events"
git remote add origin https://github.com/katarsaad/system-events.git
git push -u origin main
cd ....


cd packages\feature-flags
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/feature-flags"
git remote add origin https://github.com/katarsaad/system-feature-flags.git
git push -u origin main
cd ....


cd packages\file-storage
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/file-storage"
git remote add origin https://github.com/katarsaad/system-file-storage.git
git push -u origin main
cd ....


cd packages\health
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/health"
git remote add origin https://github.com/katarsaad/system-health.git
git push -u origin main
cd ....


cd packages\infrastructure
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/infrastructure"
git remote add origin https://github.com/katarsaad/system-infrastructure.git
git push -u origin main
cd ....


cd packages\logging
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/logging"
git remote add origin https://github.com/katarsaad/system-logging.git
git push -u origin main
cd ....


cd packages\monitoring
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/monitoring"
git remote add origin https://github.com/katarsaad/system-monitoring.git
git push -u origin main
cd ....


cd packages\notifications
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/notifications"
git remote add origin https://github.com/katarsaad/system-notifications.git
git push -u origin main
cd ....


cd packages\queue
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/queue"
git remote add origin https://github.com/katarsaad/system-queue.git
git push -u origin main
cd ....


cd packages\rate-limiting
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/rate-limiting"
git remote add origin https://github.com/katarsaad/system-rate-limiting.git
git push -u origin main
cd ....


cd packages\search
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/search"
git remote add origin https://github.com/katarsaad/system-search.git
git push -u origin main
cd ....


cd packages\security
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/security"
git remote add origin https://github.com/katarsaad/system-security.git
git push -u origin main
cd ....


cd packages\shared
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/shared"
git remote add origin https://github.com/katarsaad/system-shared.git
git push -u origin main
cd ....


cd packages\system-module
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/system-module"
git remote add origin https://github.com/katarsaad/system-system-module.git
git push -u origin main
cd ....


cd packages\testing
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/testing"
git remote add origin https://github.com/katarsaad/system-testing.git
git push -u origin main
cd ....


cd packages\validation
git init
echo node_modules/> .gitignore
echo dist/>> .gitignore
echo *.log>> .gitignore
git add .
git commit -m "Initial commit: @system/validation"
git remote add origin https://github.com/katarsaad/system-validation.git
git push -u origin main
cd ....

echo All repositories pushed!
pause
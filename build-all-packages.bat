@echo off
echo Building all packages in dependency order...

set PACKAGES=core shared monitoring security infrastructure validation events queue notifications audit health search backup config feature-flags file-storage rate-limiting logging testing system-module

for %%p in (%PACKAGES%) do (
    echo.
    echo ========================================
    echo Building package: %%p
    echo ========================================
    cd packages\%%p
    call npm install
    call npm run build
    call npm version patch
    call npm publish
    cd ..\..
    if errorlevel 1 (
        echo Failed to build %%p
        pause
        exit /b 1
    )
)

echo.
echo All packages built successfully!
pause
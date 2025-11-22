@echo off
setlocal enabledelayedexpansion

echo ========================================
echo HTTPS Setup for Next.js with Self-Signed Certs
echo ========================================

REM Create certificates directory
if not exist "certs" mkdir certs
cd certs

REM Check if certificates already exist
if exist "localhost-key.pem" (
    echo Certificates already exist in certs/ directory
    cd ..
    goto update_config
)

echo.
echo Installing mkcert globally...
choco install mkcert -y

REM Setup local CA
echo.
echo Setting up local certificate authority...
mkcert -install

REM Create certificates for localhost and lcl.host
echo.
echo Creating certificates for localhost and lcl.host...
mkcert localhost 127.0.0.1 lcl.host "*.lcl.host"

REM Rename certificates to standard names
if exist "localhost+2.pem" (
    ren "localhost+2.pem" "localhost-cert.pem"
    ren "localhost+2-key.pem" "localhost-key.pem"
)

cd ..

:update_config
echo.
echo ========================================
echo Configuration Complete!
echo ========================================
echo.
echo Your certificates are in: certs/
echo.
echo Next steps:
echo 1. Add to your hosts file (C:\Windows\System32\drivers\etc\hosts):
echo    127.0.0.1 lcl.host
echo.
echo 2. Update frontend/next.config.mjs with HTTPS config
echo.
echo 3. Run: npm run dev:https
echo.
pause

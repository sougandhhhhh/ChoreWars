@echo off
setlocal EnableDelayedExpansion

:: ============================================================
:: run-site.bat — Launch the Next.js dev/prod server
:: ============================================================

:: ----- 1. Detect package manager (prefer pnpm, fallback npm) -----
where pnpm >nul 2>&1
if !ERRORLEVEL!==0 (
  set "PM=pnpm"
) else (
  set "PM=npm"
)
echo Using package manager: !PM!

:: ----- 2. Resolve full path to the package manager executable -----
set "PMEXE="
for /f "delims=" %%I in ('where !PM! 2^>nul') do (
  if not defined PMEXE set "PMEXE=%%I"
)
if not defined PMEXE (
  echo !PM! executable not found in PATH.
  goto :TryInstallNode
)
echo Resolved executable: !PMEXE!
goto :CheckNodeModules

:: ----- 3. Attempt to install Node.js via winget -----
:TryInstallNode
where winget >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
  echo No package manager and no winget detected.
  echo Please install Node.js from https://nodejs.org/ and ensure it is on PATH.
  start "" "https://nodejs.org/en/download/"
  pause
  exit /b 1
)

echo Found winget — attempting to install Node.js LTS (may prompt for elevation)...
powershell -NoProfile -Command "Start-Process -FilePath 'winget' -ArgumentList 'install','-e','--id','OpenJS.NodeJS.LTS' -Verb RunAs -Wait"

echo Re-checking for !PM! in PATH...
set "PMEXE="
for /f "delims=" %%I in ('where !PM! 2^>nul') do (
  if not defined PMEXE set "PMEXE=%%I"
)
if not defined PMEXE (
  echo Still could not find !PM! after Node.js install. Please restart your terminal and try again.
  pause
  exit /b 1
)
echo Resolved executable: !PMEXE!

:: ----- 4. Install dependencies if node_modules missing -----
:CheckNodeModules
if exist "node_modules" goto :StartServer

echo node_modules not found — installing dependencies with !PM!...
call "!PMEXE!" install
if !ERRORLEVEL! NEQ 0 (
  echo Install failed. Exiting.
  pause
  exit /b !ERRORLEVEL!
)

:: ----- 5. Start the server -----
:StartServer
set "MODE=dev"
if /I "%~1"=="start" set "MODE=start"
if /I "%~1"=="prod"  set "MODE=start"

if "!MODE!"=="start" (
  echo Building for production...
  call "!PMEXE!" run build
  if !ERRORLEVEL! NEQ 0 (
    echo Build failed. Exiting.
    pause
    exit /b !ERRORLEVEL!
  )
  echo Starting production server in background...
  powershell -NoProfile -Command "Start-Process -FilePath '!PMEXE!' -ArgumentList 'run','start' -WindowStyle Hidden"
) else (
  echo Starting development server in background...
  powershell -NoProfile -Command "Start-Process -FilePath '!PMEXE!' -ArgumentList 'run','dev' -WindowStyle Hidden"
)

:: ----- 6. Open browser -----
ping -n 4 127.0.0.1 >nul
start "" "http://localhost:3000/login?startup=true"

endlocal
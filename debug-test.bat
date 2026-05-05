@echo off
echo START DEBUG
where pnpm >nul 2>&1
if %ERRORLEVEL%==0 (set PM=pnpm) else (set PM=npm)
echo PM=%PM%
for /f "delims=" %%I in ('where %PM% 2^>nul') do set PMEXE=%%I
echo PMEXE=%PMEXE%
pause

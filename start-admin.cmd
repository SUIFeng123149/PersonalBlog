@echo off
rem Mizuki admin launcher (Windows).
rem This script can be placed ANYWHERE (inside the blog repo, on the Desktop, etc.)
rem and double-clicked or run from cmd/PowerShell. It auto-locates the blog root,
rem handles port conflicts, and opens the browser when ready.
rem
rem Blog root lookup order:
rem   1. MIZUKI_ROOT environment variable
rem   2. this script's own folder / parent folders
rem   3. mizuki-root.txt next to this script
rem   4. %USERPROFILE%\.mizuki-root.txt   (works from any location)
rem
rem NOTE: keep this file pure ASCII. cmd.exe parses .cmd files in the system OEM
rem codepage, and non-ASCII text corrupts the batch logic.
setlocal enabledelayedexpansion

title Mizuki Admin Launcher

set "ROOT="

rem 1) MIZUKI_ROOT environment variable
if defined MIZUKI_ROOT if exist "%MIZUKI_ROOT%\scripts\start-admin.mjs" set "ROOT=%MIZUKI_ROOT%"

rem 2) same folder as this script
if not defined ROOT if exist "%~dp0scripts\start-admin.mjs" set "ROOT=%~dp0"

rem 3) walk up parent folders (max 10 levels)
if not defined ROOT (
  set "CUR=%~dp0"
  for /l %%I in (1,1,10) do (
    if not defined ROOT (
      if exist "!CUR!scripts\start-admin.mjs" set "ROOT=!CUR!"
      set "CUR=!CUR!..\"
    )
  )
)

rem 4) mizuki-root.txt next to this script (for copies placed outside the repo)
if not defined ROOT if exist "%~dp0mizuki-root.txt" (
  for /f "usebackq delims=" %%L in ("%~dp0mizuki-root.txt") do (
    if not defined ROOT set "ROOT=%%L"
  )
  if not exist "!ROOT!\scripts\start-admin.mjs" set "ROOT="
)

rem 5) %USERPROFILE%\.mizuki-root.txt (location-independent fallback)
if not defined ROOT if exist "%USERPROFILE%\.mizuki-root.txt" (
  for /f "usebackq delims=" %%L in ("%USERPROFILE%\.mizuki-root.txt") do (
    if not defined ROOT set "ROOT=%%L"
  )
  if not exist "!ROOT!\scripts\start-admin.mjs" set "ROOT="
)

if not defined ROOT (
  echo [ERROR] Blog root not found ^(missing scripts\start-admin.mjs^).
  echo.
  echo This script can run from anywhere inside the blog repo, or from outside when
  echo one of the following exists:
  echo   1. a file "mizuki-root.txt" next to this script containing the repo path
  echo   2. a file "%USERPROFILE%\.mizuki-root.txt" containing the repo path
  echo   3. a MIZUKI_ROOT environment variable pointing to the repo root
  echo.
  echo Example repo path: D:\path\to\Mizuki
  echo.
  pause
  exit /b 1
)

rem strip trailing backslash
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

rem check Node.js
node --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node.js ^>=20 from https://nodejs.org/
  pause
  exit /b 1
)

rem launch the admin server
set "MIZUKI_ROOT=%ROOT%"
node "%ROOT%\scripts\start-admin.mjs" %*
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" (
  echo.
  echo Admin server exited with code %EXIT_CODE%. See output above.
  pause
)
exit /b %EXIT_CODE%

@echo off
chcp 65001 >nul
title Lov - servidor local
cd /d "%~dp0front"

set PORT=5500
echo.
echo  ========================================
echo   Lov - rodando em http://localhost:%PORT%
echo   Dica: aperte F12 e ative o modo celular
echo   (Ctrl+Shift+M) para ver como no mobile.
echo   Feche esta janela para parar o servidor.
echo  ========================================
echo.

start "" "http://localhost:%PORT%"

where python >nul 2>&1
if %errorlevel%==0 (
    python -m http.server %PORT%
    goto :eof
)

where node >nul 2>&1
if %errorlevel%==0 (
    npx -y serve -l %PORT% .
    goto :eof
)

echo  [ERRO] Python ou Node.js nao encontrado. Instale um deles e tente de novo.
pause

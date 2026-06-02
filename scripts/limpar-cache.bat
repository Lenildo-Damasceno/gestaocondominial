@echo off
echo Limpando cache Next.js...
rmdir /s /q .next
echo.
echo Cache removido! Agora vou reconstruir...
npm run build
pause
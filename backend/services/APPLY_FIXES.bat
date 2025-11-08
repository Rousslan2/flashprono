@echo off
echo ========================================
echo Correction automatique de l'API FlashProno
echo ========================================
echo.

cd /d C:\Users\Rousslan\Desktop\FlashProno\backend\services

echo 1. Creation des backups...
copy soccerDataService.js soccerDataService.js.backup
copy pronosticChecker.js pronosticChecker.js.backup
echo    Backups crees !
echo.

echo 2. Application du fix soccerDataService.js...
copy /Y soccerDataService_FIXED.js soccerDataService.js
echo    soccerDataService.js mis a jour !
echo.

echo 3. Verification du fichier .env...
if exist ..\..\.env (
    echo    .env trouve !
    findstr /C:"SOCCER_DATA_API_KEY" ..\..\.env
) else (
    echo    ATTENTION: .env non trouve !
)
echo.

echo ========================================
echo CORRECTION TERMINEE !
echo ========================================
echo.
echo PROCHAINES ETAPES:
echo 1. Ouvrir pronosticChecker.js
echo 2. Appliquer les changements du fichier pronosticChecker_IMPROVEMENTS.js
echo 3. Tester avec: node check-match-detection.js
echo.
pause

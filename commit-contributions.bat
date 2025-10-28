@echo off
echo Committing contributions to JARVIS OMEGA PROTOCOL...
echo.

git commit -m "docs: add comprehensive project documentation" -m "- Added enhanced README with badges and detailed features" -m "- Added CONTRIBUTING.md with contribution guidelines" -m "- Added LICENSE (MIT)" -m "- Added CHANGELOG.md with version history" -m "- Added SECURITY.md with security policy" -m "- Added .env.example for easy configuration" -m "- Added GitHub issue templates (bug report, feature request)" -m "- Added pull request template" -m "- Improved project documentation and developer experience"

git push origin main

echo.
echo Contributions pushed successfully!
pause

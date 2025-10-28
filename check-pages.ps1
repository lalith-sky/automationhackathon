# JARVIS OMEGA PROTOCOL - Page Checker
Write-Host "================================" -ForegroundColor Cyan
Write-Host "JARVIS OMEGA PROTOCOL" -ForegroundColor Cyan
Write-Host "Page Status Checker" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$pages = @(
    @{Name="Demo Page"; Path="/demo.html"},
    @{Name="Login Page"; Path="/login"},
    @{Name="Register Page"; Path="/signup"},
    @{Name="Dashboard"; Path="/"},
    @{Name="Test Suite"; Path="/test.html"},
    @{Name="API Health"; Path="/api/health"}
)

Write-Host "Checking pages...`n" -ForegroundColor Yellow

foreach ($page in $pages) {
    $url = $baseUrl + $page.Path
    Write-Host "Testing: $($page.Name)" -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " [OK]" -ForegroundColor Green
        } else {
            Write-Host " [FAILED - Status: $($response.StatusCode)]" -ForegroundColor Red
        }
    } catch {
        Write-Host " [ERROR - $($_.Exception.Message)]" -ForegroundColor Red
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Opening pages in browser..." -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Cyan

# Open demo page
Start-Process "$baseUrl/demo.html"

Write-Host "`nDemo page opened!" -ForegroundColor Green
Write-Host "`nAvailable URLs:" -ForegroundColor Cyan
Write-Host "  Demo:     $baseUrl/demo.html" -ForegroundColor White
Write-Host "  Login:    $baseUrl/login" -ForegroundColor White
Write-Host "  Register: $baseUrl/signup" -ForegroundColor White
Write-Host "  Test:     $baseUrl/test.html" -ForegroundColor White
Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# PowerShell script to import dashboard
$headers = @{
    "Authorization" = "Bearer gm_0e18ef2b3e6d4612343c3c39293dab1464aea1b58667ca9d9f1b2ad127a03852"
    "Content-Type" = "application/json"
}

$dashboardContent = Get-Content "skew-dashboard-final.json" -Raw | ConvertFrom-Json
$requestBody = @{
    dashboard = $dashboardContent
    folderId = 0
    overwrite = $false
} | ConvertTo-Json -Depth 100

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboards/db" -Method Post -Headers $headers -Body $requestBody
    Write-Host "✅ Dashboard imported successfully!" -ForegroundColor Green
    Write-Host "Dashboard ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Dashboard URL: $($response.url)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Import failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Yellow
}
# Test PostgreSQL query with API key authentication
$apiKey = "gm_0e18ef2b3e6d4612343c3c39293dab1464aea1b58667ca9d9f1b2ad127a03852"
$baseUrl = "http://localhost:3001"

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = @{
    queries = @(
        @{
            refId = "A"
            datasource = "ds-1766569335163"
            rawSql = "SELECT * FROM skew_final_csv LIMIT 5"
            format = "table"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    Write-Host "Testing PostgreSQL query..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$baseUrl/api/query" -Method Post -Headers $headers -Body $body
    Write-Host "✅ Query successful!" -ForegroundColor Green
    Write-Host "Data:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Query failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}
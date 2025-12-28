# Test Hugging Face Space API
# Run this script to test if your Space is working

$spaceUrl = "https://unwonted-uplift-commumed-llm.hf.space"

Write-Host "Testing Space API..." -ForegroundColor Cyan
Write-Host "Space URL: $spaceUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Check if Space is accessible
Write-Host "1. Testing Space accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $spaceUrl -Method GET -UseBasicParsing
    Write-Host "   Space is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Space is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test Embedding API
Write-Host ""
Write-Host "2. Testing Embedding API..." -ForegroundColor Yellow
$embeddingBody = '{"data": ["test text"], "fn_index": 1}'

try {
    $response = Invoke-WebRequest -Uri "$spaceUrl/run/predict" `
        -Method POST `
        -ContentType "application/json" `
        -Body $embeddingBody `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   Embedding API responded (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Response structure: $($result | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "   Embedding API failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Test Chat API
Write-Host ""
Write-Host "3. Testing Chat API..." -ForegroundColor Yellow
$chatBody = '{"data": [[{"role": "user", "content": "Hello"}], 0.1, 2000], "fn_index": 0}'

try {
    $response = Invoke-WebRequest -Uri "$spaceUrl/run/predict" `
        -Method POST `
        -ContentType "application/json" `
        -Body $chatBody `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "   Chat API responded (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Response structure: $($result | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "   Chat API failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Cyan

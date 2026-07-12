# GramMart AI Assistant Test Script
# Tests multilingual AI assistant functionality

$API_BASE = if ($env:API_BASE_URL) { $env:API_BASE_URL } else { "http://localhost:8080/api" }
$FRONTEND_BASE = if ($env:FRONTEND_URL) { $env:FRONTEND_URL } else { "http://localhost:3000" }

Write-Host "=== GramMart AI Assistant Test Suite ===" -ForegroundColor Cyan
Write-Host "API Base: $API_BASE"
Write-Host "Frontend Base: $FRONTEND_BASE"
Write-Host ""

# Test 1: Backend Health Check
Write-Host "[Test 1] Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_BASE/actuator/health" -Method GET
    if ($health.status -eq "UP") {
        Write-Host "✓ Backend is UP" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend health check failed: $($health.status)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Backend is not reachable: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Voice Command Parsing (Auto Language Detection)
Write-Host "[Test 2] Voice Command Parsing - Tanglish..." -ForegroundColor Yellow
$voicePayload = @{
    transcript = "Kumar account-la 2 kg arisi add pannunga"
    language = "AUTO"
} | ConvertTo-Json

try {
    $voiceResult = Invoke-RestMethod -Uri "$API_BASE/voice/normalize" -Method POST `
        -ContentType "application/json" -Body $voicePayload
    
    Write-Host "  Detected Language: $($voiceResult.detectedLanguage)" -ForegroundColor Cyan
    Write-Host "  Intent: $($voiceResult.intent)" -ForegroundColor Cyan
    Write-Host "  Customer: $($voiceResult.customerName)" -ForegroundColor Cyan
    Write-Host "  Product: $($voiceResult.productName)" -ForegroundColor Cyan
    Write-Host "  Quantity: $($voiceResult.quantity)" -ForegroundColor Cyan
    
    if ($voiceResult.detectedLanguage -eq "TANGLISH" -and $voiceResult.intent -eq "ADD_PURCHASE") {
        Write-Host "✓ Voice parsing works correctly" -ForegroundColor Green
    } else {
        Write-Host "✗ Voice parsing has issues" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Voice parsing failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Tamil Product Query
Write-Host "[Test 3] AI Chat - Tamil Product Query..." -ForegroundColor Yellow
$tamilQuery = @{
    message = "அரிசி விலை என்ன?"
    language = "AUTO"
    customers = @()
    products = @(
        @{
            name = "Rice"
            sku = "RICE-001"
            sellingPrice = "50"
            nameTa = "அரிசி"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $aiResult = Invoke-RestMethod -Uri "$FRONTEND_BASE/api/ai/chat" -Method POST `
        -ContentType "application/json" -Body $tamilQuery
    
    Write-Host "  AI Response: $($aiResult.answer)" -ForegroundColor Cyan
    Write-Host "  Live Response: $($aiResult.live)" -ForegroundColor Cyan
    
    if ($aiResult.answer -match "அரிசி|Rice") {
        Write-Host "✓ Tamil product query works" -ForegroundColor Green
    } else {
        Write-Host "✗ Tamil query response unexpected" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ AI chat failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Hindi Product Query
Write-Host "[Test 4] AI Chat - Hindi Product Query..." -ForegroundColor Yellow
$hindiQuery = @{
    message = "चावल की कीमत क्या है?"
    language = "AUTO"
    customers = @()
    products = @(
        @{
            name = "Rice"
            sku = "RICE-001"
            sellingPrice = "50"
            nameHi = "चावल"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $aiResult = Invoke-RestMethod -Uri "$FRONTEND_BASE/api/ai/chat" -Method POST `
        -ContentType "application/json" -Body $hindiQuery
    
    Write-Host "  AI Response: $($aiResult.answer)" -ForegroundColor Cyan
    
    if ($aiResult.answer -match "चावल|Rice") {
        Write-Host "✓ Hindi product query works" -ForegroundColor Green
    } else {
        Write-Host "✗ Hindi query response unexpected" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Hindi chat failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: English with Action Block
Write-Host "[Test 5] AI Chat - English with Action Block..." -ForegroundColor Yellow
$englishAction = @{
    message = "Add 2 kg rice to Kumar account"
    language = "ENGLISH"
    customers = @(
        @{
            name = "Kumar"
            outstandingBalance = "100"
        }
    )
    products = @(
        @{
            name = "Rice"
            sku = "RICE-001"
            sellingPrice = "50"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $aiResult = Invoke-RestMethod -Uri "$FRONTEND_BASE/api/ai/chat" -Method POST `
        -ContentType "application/json" -Body $englishAction
    
    Write-Host "  AI Response: $($aiResult.answer)" -ForegroundColor Cyan
    
    if ($aiResult.answer -match '```action') {
        Write-Host "✓ Action block detected in response" -ForegroundColor Green
        
        # Extract action block
        if ($aiResult.answer -match '```action\s*([\s\S]+?)\s*```') {
            $actionJson = $matches[1]
            $action = $actionJson | ConvertFrom-Json
            Write-Host "  Action Intent: $($action.intent)" -ForegroundColor Cyan
            Write-Host "  Customer: $($action.customerName)" -ForegroundColor Cyan
            Write-Host "  Product: $($action.productAlias)" -ForegroundColor Cyan
            Write-Host "  Quantity: $($action.quantity)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠ No action block found (might be informational query)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ English action chat failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Hinglish Mixed Language
Write-Host "[Test 6] AI Chat - Hinglish Mixed Language..." -ForegroundColor Yellow
$hinglishQuery = @{
    message = "Kumar account mein 2 kg rice add karo"
    language = "AUTO"
    customers = @(
        @{
            name = "Kumar"
            outstandingBalance = "200"
        }
    )
    products = @(
        @{
            name = "Rice"
            sku = "RICE-001"
            sellingPrice = "50"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $aiResult = Invoke-RestMethod -Uri "$FRONTEND_BASE/api/ai/chat" -Method POST `
        -ContentType "application/json" -Body $hinglishQuery
    
    Write-Host "  AI Response: $($aiResult.answer)" -ForegroundColor Cyan
    
    if ($aiResult.answer -match "Kumar|rice|add") {
        Write-Host "✓ Hinglish query works" -ForegroundColor Green
    } else {
        Write-Host "✗ Hinglish query response unexpected" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Hinglish chat failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Run this script against:"
Write-Host "  - Local development: localhost:8080 (backend) + localhost:3000 (frontend)"
Write-Host "  - Production: Set API_BASE_URL and FRONTEND_URL environment variables"
Write-Host ""
Write-Host "To test production deployment:" -ForegroundColor Yellow
Write-Host '  $env:API_BASE_URL = "https://your-backend.railway.app/api"'
Write-Host '  $env:FRONTEND_URL = "https://grammart.vercel.app"'
Write-Host '  .\test-ai-assistant.ps1'
Write-Host ""

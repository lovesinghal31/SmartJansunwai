# WhatsApp Bot Test Script for PowerShell
# This script tests all the WhatsApp bot functionality

Write-Host "Testing WhatsApp Bot Functionality..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Generate a unique phone number for this test session
$testPhone = "whatsapp:+91" + (Get-Random -Minimum 7000000000 -Maximum 9999999999)
Write-Host "Using test phone number: $testPhone" -ForegroundColor Blue

# Test 1: Initial greeting
Write-Host "`n1. Testing initial greeting..." -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$testPhone`", `"Body`": `"hi`"}"
Write-Host "Response: $($response1.response)" -ForegroundColor Cyan

# Test 2: Filing a complaint
Write-Host "`n2. Testing complaint filing..." -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$testPhone`", `"Body`": `"the street light near my house is not working since 3 days and creating safety issues`"}"
Write-Host "Response: $($response2.response)" -ForegroundColor Cyan

# Test 3: Providing location
Write-Host "`n3. Providing location..." -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$testPhone`", `"Body`": `"Rajwada Square, Indore`"}"
Write-Host "Response: $($response3.response)" -ForegroundColor Cyan

# Test 4: Setting password
Write-Host "`n4. Setting password..." -ForegroundColor Yellow
$response4 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$testPhone`", `"Body`": `"mypass123`"}"
Write-Host "Response: $($response4.response)" -ForegroundColor Cyan

# Extract complaint ID from response
if ($response4.response -match "Complaint ID is: ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})") {
    $complaintId = $matches[1]
    Write-Host "Complaint ID extracted: $complaintId" -ForegroundColor Green
    
    # Test 5: Check status with new phone number
    $statusPhone = "whatsapp:+91" + (Get-Random -Minimum 7000000000 -Maximum 9999999999)
    Write-Host "`n5. Testing status check with new phone: $statusPhone..." -ForegroundColor Yellow
    $response5 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$statusPhone`", `"Body`": `"check status`"}"
    Write-Host "Response: $($response5.response)" -ForegroundColor Cyan
    
    # Test 6: Provide complaint ID
    Write-Host "`n6. Providing complaint ID..." -ForegroundColor Yellow
    $response6 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$statusPhone`", `"Body`": `"$complaintId`"}"
    Write-Host "Response: $($response6.response)" -ForegroundColor Cyan
} else {
    Write-Host "Could not extract complaint ID from response: $($response4.response)" -ForegroundColor Red
}

# Test 7: Invalid input with another new phone
$invalidPhone = "whatsapp:+91" + (Get-Random -Minimum 7000000000 -Maximum 9999999999)
Write-Host "`n7. Testing invalid input with phone: $invalidPhone..." -ForegroundColor Yellow
$response7 = Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body "{`"From`": `"$invalidPhone`", `"Body`": `"random nonsense text`"}"
Write-Host "Response: $($response7.response)" -ForegroundColor Cyan

Write-Host "`nAll tests completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

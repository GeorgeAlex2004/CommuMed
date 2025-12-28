# PowerShell script to help set up OCR dependencies
# Run: .\scripts\setup-ocr.ps1

Write-Host "🔍 Checking OCR Setup Requirements..." -ForegroundColor Cyan
Write-Host ""

# Check Tesseract
Write-Host "1. Checking Tesseract OCR..." -ForegroundColor Yellow
$tesseractPaths = @(
    "C:\Program Files\Tesseract-OCR\tesseract.exe",
    "C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    "$env:LOCALAPPDATA\Programs\Tesseract-OCR\tesseract.exe"
)

$tesseractFound = $false
foreach ($path in $tesseractPaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ Tesseract found at: $path" -ForegroundColor Green
        $tesseractFound = $true
        break
    }
}

if (-not $tesseractFound) {
    try {
        $version = tesseract --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Tesseract is in PATH" -ForegroundColor Green
            $tesseractFound = $true
        }
    } catch {
        # Not found
    }
}

if (-not $tesseractFound) {
    Write-Host "   ❌ Tesseract not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "   📥 Download and install Tesseract:" -ForegroundColor Yellow
    Write-Host "      https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Cyan
    Write-Host "   ⚠️  IMPORTANT: Check 'Add to PATH during installation" -ForegroundColor Yellow
}

# Check Python
Write-Host ""
Write-Host "2. Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python not found" -ForegroundColor Red
    Write-Host "   📥 Download from: https://www.python.org/downloads/" -ForegroundColor Cyan
}

# Check Python packages
Write-Host ""
Write-Host "3. Checking Python packages..." -ForegroundColor Yellow
try {
    python -c "import pdf2image, pytesseract, PIL" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ All packages installed (pdf2image, pytesseract, PIL)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Some packages missing" -ForegroundColor Red
        Write-Host "   📦 Install with: pip install pdf2image pytesseract pillow" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Error checking packages" -ForegroundColor Red
    Write-Host "   📦 Install with: pip install pdf2image pytesseract pillow" -ForegroundColor Cyan
}

# Check Poppler
Write-Host ""
Write-Host "4. Checking Poppler (for PDF to image conversion)..." -ForegroundColor Yellow
$popplerPaths = @(
    "$env:LOCALAPPDATA\Programs\poppler\Library\bin",
    "C:\poppler\Library\bin",
    "C:\Program Files\poppler\Library\bin"
)

$popplerFound = $false
foreach ($path in $popplerPaths) {
    if (Test-Path "$path\pdftoppm.exe") {
        Write-Host "   ✅ Poppler found at: $path" -ForegroundColor Green
        $popplerFound = $true
        break
    }
}

if (-not $popplerFound) {
    try {
        pdftoppm -v 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Poppler is in PATH" -ForegroundColor Green
            $popplerFound = $true
        }
    } catch {
        # Not found
    }
}

if (-not $popplerFound) {
    Write-Host "   ⚠️  Poppler not found (optional but recommended)" -ForegroundColor Yellow
    Write-Host "   📥 Download from: https://github.com/oschwartz10612/poppler-windows/releases" -ForegroundColor Cyan
    Write-Host "   📁 Extract and add Library\bin to PATH" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
if ($tesseractFound) {
    Write-Host "✅ Ready to run OCR!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step:" -ForegroundColor Yellow
    Write-Host "  npm run ocr-full-pdf -- `"path/to/your/pdf.pdf`"" -ForegroundColor Cyan
} else {
    Write-Host "❌ Please install Tesseract OCR first" -ForegroundColor Red
    Write-Host ""
    Write-Host "After installation, restart this terminal and run this script again" -ForegroundColor Yellow
}


# Installing Tesseract OCR on Windows

## Quick Installation

### Option 1: Direct Download (Recommended)

1. **Download Tesseract:**
   - Go to: https://github.com/UB-Mannheim/tesseract/wiki
   - Click on the latest Windows installer (e.g., `tesseract-ocr-w64-setup-5.x.x.exe`)
   - Download and run the installer

2. **During Installation:**
   - **IMPORTANT:** Check the box "Add to PATH" when prompted
   - Or manually add after installation (see below)

3. **Verify Installation:**
   ```powershell
   tesseract --version
   ```

### Option 2: Using Chocolatey (If You Have It)

```powershell
choco install tesseract
```

### Option 3: Using Scoop (If You Have It)

```powershell
scoop install tesseract
```

## Manual PATH Setup (If Needed)

If Tesseract is installed but not in PATH:

1. Find Tesseract installation (usually: `C:\Program Files\Tesseract-OCR`)
2. Add to PATH:
   - Open System Properties → Environment Variables
   - Edit "Path" variable
   - Add: `C:\Program Files\Tesseract-OCR`
   - Or add: `C:\Program Files (x86)\Tesseract-OCR` (if 32-bit)

3. Restart terminal/PowerShell

## Verify Installation

After installation, run:
```powershell
tesseract --version
```

You should see something like:
```
tesseract 5.x.x
```

## Next Steps

Once Tesseract is installed:
1. Restart your terminal
2. Run: `npm run ocr-full-pdf -- "path/to/your/pdf.pdf"`


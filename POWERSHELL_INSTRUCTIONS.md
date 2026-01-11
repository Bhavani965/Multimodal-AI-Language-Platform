# PowerShell Instructions - How to Start the App

Since you're using PowerShell, here are the correct commands:

## Method 1: Use PowerShell Scripts (Easiest)

### Option A: Start Both Servers Automatically
1. Right-click on `start_app.ps1`
2. Select "Run with PowerShell"
3. Two windows will open automatically
4. Browser will open automatically
5. Done!

### Option B: Start Servers Separately
1. Right-click on `start_backend.ps1` → "Run with PowerShell"
2. Right-click on `start_frontend.ps1` → "Run with PowerShell"
3. Open browser: `http://localhost:8000`

## Method 2: Manual PowerShell Commands

### Start Backend:
```powershell
cd backend
python app.py
```

### Start Frontend (in a NEW PowerShell window):
```powershell
cd frontend
python -m http.server 8000
```

## Method 3: Use Batch Files (if PowerShell scripts don't work)

1. Double-click `START_BACKEND.bat`
2. Double-click `START_FRONTEND.bat`
3. Open browser: `http://localhost:8000`

## Important Notes for PowerShell

### If you get "Execution Policy" error:
Run this command in PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PowerShell Syntax:
- **Don't use** `&&` (that's for bash/cmd)
- **Use** `;` to separate commands: `cd backend; python app.py`
- **Or** run commands on separate lines

### Correct PowerShell Commands:

✅ **Correct:**
```powershell
cd backend
python app.py
```

✅ **Also Correct:**
```powershell
cd backend; python app.py
```

❌ **Wrong:**
```powershell
cd backend && python app.py
```

## Quick Start Commands

### Backend:
```powershell
Set-Location backend
python app.py
```

### Frontend:
```powershell
Set-Location frontend
python -m http.server 8000
```

## Troubleshooting

### Problem: "Execution policy" error
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problem: Scripts won't run
**Solution:** Use the batch files (.bat) instead

### Problem: "python is not recognized"
**Solution:** Install Python and add to PATH

## Recommended Method

**Use the batch files** - they work in both CMD and PowerShell:
1. Double-click `START_BACKEND.bat`
2. Double-click `START_FRONTEND.bat`
3. Open browser: `http://localhost:8000`

---

**Remember: Keep both server windows open while using the app!**


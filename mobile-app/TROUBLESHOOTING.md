# AparaiTech Mobile App - Troubleshooting Guide

## Issue: App Not Opening / Unmatched Route

### Solution: Complete Cache Clear & Rebuild

Follow these steps in order:

#### Step 1: Stop the Dev Server
- Press `Ctrl+C` in the terminal where `npm start` is running
- Close Expo Go app completely

#### Step 2: Clear All Caches

**On Windows PowerShell:**
```powershell
cd d:\Aparaitech\Aparaitech_Pregnancy_Wellness\mobile-app

# Clear Expo cache
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue

# Clear Metro bundler cache
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

Write-Host "✓ All caches cleared"
```

#### Step 3: Reinstall & Rebuild

```powershell
# Reinstall dependencies
npm install

# Start with clear flag
npm start -- --clear
```

#### Step 4: Wait for Build
- Wait for Expo to finish bundling (you'll see "Waiting on ExponentUpdates")
- This may take 2-3 minutes

#### Step 5: Test in Expo Go

1. Open Expo Go app
2. Scan the QR code from terminal
3. Wait for app to load
4. Test login with:
   - **Mother**: mother@aparaitech.com / Mother@123
   - **Caregiver**: caregiver@aparaitech.com / Caregiver@123

## Expected Results

- **Mother Login**: Routes to Mother Dashboard (Heart icon, Home/Track/Calendar/Reports/Profile tabs)
- **Caregiver Login**: Routes to Caregiver Dashboard (same tabs but different content - "Caregiver Dashboard" title)

## If Still Not Working

### Check 1: Verify Caregiver Files Exist
```powershell
Get-ChildItem -Path "app\(caregiver)" -Name
# Should show: _layout.tsx, index.tsx, track.tsx, calendar.tsx, reports.tsx, profile.tsx
```

### Check 2: Verify No TypeScript Errors
```powershell
npx tsc --noEmit
# Should complete with no errors
```

### Check 3: Check for Syntax Errors
Look for:
- Missing closing braces `}`
- Missing semicolons `;`
- Incorrect imports
- Typos in component names

### Check 4: Review Build Error
If terminal shows error:
```
1. Note the exact error message
2. Check the file mentioned in error
3. Look for syntax issues
4. Save the file again
5. Wait for hot reload
```

## Common Issues

### "Cannot find module"
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### "Unmatched route /(caregiver)"
- Clear `.expo` folder
- Restart `npm start -- --clear`

### "ReferenceError: _layout is not defined"
- Check `_layout.tsx` has `export default`
- Check all imports are correct
- Verify no circular imports

## Notes

- Route changes require Expo cache clear (hot reload isn't enough)
- The `(caregiver)` folder is a route group like `(mother)` and `(auth)`
- Both should have identical tab navigation structure
- Only the content and titles differ between Mother and Caregiver dashboards

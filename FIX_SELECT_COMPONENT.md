# Fix: Select Component Missing

## The Issue
The voice intake form uses a Select component that requires `@radix-ui/react-select` package.

## ✅ Quick Fix

Run this command in the frontend directory:

```bash
cd frontend
npm install @radix-ui/react-select
```

Then restart the dev server:

```bash
npm run dev
```

## 🎯 What This Does

Installs the Radix UI Select component library that provides the dropdown for language selection in the voice intake form.

## ✅ Already Created

I've already created the Select component wrapper at:
- `frontend/components/ui/select.tsx`

Once you install the package, it will work automatically!

## 📝 Summary

1. Install package: `npm install @radix-ui/react-select`
2. Restart dev server: `npm run dev`
3. Done! ✅

The voice intake page will now load without errors.

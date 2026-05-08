# GitHub Pages Deployment

## First Deployment

```powershell
git init
git add .
git commit -m "Create API key vault manager"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/api-key-vault-manager.git
git push -u origin main
```

Then open the repository settings:

1. Go to `Settings`.
2. Go to `Pages`.
3. Set source to `GitHub Actions`.
4. Run the `Deploy static vault app to GitHub Pages` workflow.

## Before Making The Repo Public

Run this from the project root:

```powershell
git status --short
```

Review everything staged or committed. Do not publish encrypted vault exports unless you intentionally want that risk profile, and never publish raw secrets.

## Local Testing

```powershell
npm run check
npm run serve
```

Open `http://localhost:4173`.

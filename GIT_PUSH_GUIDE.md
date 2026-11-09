# Git Push Guide - Integrated System

## ✅ SAFE TO PUSH (Kasama sa Repository)

### Root Level Files
- ✅ `compose.yaml` - Docker configuration
- ✅ `.gitignore` - Git ignore rules
- ✅ `.env.example` - Template for environment variables
- ✅ `migrate-all.cmd` / `migrate-all.sh` - Migration scripts
- ✅ All `.md` documentation files
- ✅ `mysql-init/` - Database initialization scripts

### All Module Folders (with backend and frontend)
- ✅ `main-system/` - Full directory
- ✅ `student_account_module/` - Full directory
- ✅ `staff_id_managament/` - Full directory
- ✅ `Staff_Sticker_module/` - Full directory
- ✅ `Student_print_module/` - Full directory

### Source Code (Kasama lahat nito)
- ✅ All `.js`, `.jsx`, `.php`, `.css`, `.html` files
- ✅ `package.json`, `package-lock.json` files
- ✅ `composer.json`, `composer.lock` files
- ✅ Configuration files (`.prettierrc`, `vite.config.js`, etc.)
- ✅ Dockerfiles
- ✅ Migration files
- ✅ Routes, Controllers, Models, Components

---

## ❌ NEVER PUSH (Ignored by .gitignore)

### Environment Files with Secrets
- ❌ `.env` files in all directories (contains passwords, API keys)
- ❌ `.env.local`, `.env.production`, etc.
- ⚠️ Only push `.env.example` (without actual values)

### Dependencies (Auto-installed)
- ❌ `node_modules/` folders (all modules)
- ❌ `vendor/` folders (all Laravel backends)
- 💡 These are installed via `npm install` and `composer install`

### Build Artifacts
- ❌ `dist/`, `build/` folders
- ❌ Compiled files
- ❌ Cache folders

### Database Data
- ❌ `mysql_data/`
- ❌ `*_data/` folders
- ❌ `.sqlite`, `.db` files

### IDE & OS Files
- ❌ `.vscode/` (optional - team preference)
- ❌ `.idea/`
- ❌ `.DS_Store` (Mac)
- ❌ `Thumbs.db` (Windows)
- ❌ `desktop.ini`

### Log Files
- ❌ `*.log`
- ❌ `npm-debug.log`
- ❌ `yarn-error.log`

---

## 📁 Directory Structure (What Gets Pushed)

```
integrated-system/
├── .git/                           ← Git repository (automatic)
├── .gitignore                      ✅ Push
├── .env.example                    ✅ Push
├── compose.yaml                    ✅ Push
├── *.md                            ✅ Push (all documentation)
│
├── main-system/
│   ├── laravel-backend/
│   │   ├── app/                    ✅ Push
│   │   ├── config/                 ✅ Push
│   │   ├── database/               ✅ Push
│   │   ├── routes/                 ✅ Push
│   │   ├── composer.json           ✅ Push
│   │   ├── .env.example            ✅ Push
│   │   ├── .env                    ❌ DON'T push
│   │   └── vendor/                 ❌ DON'T push
│   │
│   └── react-frontend/
│       ├── src/                    ✅ Push
│       ├── public/                 ✅ Push
│       ├── package.json            ✅ Push
│       ├── vite.config.js          ✅ Push
│       ├── .env                    ❌ DON'T push
│       └── node_modules/           ❌ DON'T push
│
├── student_account_module/         ✅ Same structure as main-system
├── staff_id_managament/            ✅ Same structure
├── Staff_Sticker_module/           ✅ Same structure
└── Student_print_module/           ✅ Same structure
```

---

## 🔒 Important: .env Files

### ❌ NEVER push actual .env files because they contain:
- Database passwords
- API keys
- JWT secrets
- Production URLs
- Sensitive credentials

### ✅ Instead, push .env.example with placeholder values:

**Example `.env.example`:**
```env
# Database
DB_HOST=mysql
DB_DATABASE=business_center
DB_USERNAME=root
DB_PASSWORD=YourPasswordHere

# URLs
MAIN_FRONTEND_URL=http://localhost:5173
MAIN_API_URL=http://localhost:8000/api

# JWT
JWT_SECRET=your-secret-here
```

---

## 📝 Before Pushing (Checklist)

1. **Check .gitignore is working:**
   ```bash
   git status
   ```
   - Should NOT see `node_modules/`, `vendor/`, or `.env` files

2. **Verify .env files are excluded:**
   ```bash
   git ls-files | grep "\.env$"
   ```
   - Should return EMPTY (no .env files tracked)

3. **Check for sensitive data:**
   - Search for passwords in tracked files
   - Check for API keys in code

4. **Add all files:**
   ```bash
   git add .
   ```

5. **Review what will be committed:**
   ```bash
   git status
   git diff --cached
   ```

6. **Commit with meaningful message:**
   ```bash
   git commit -m "Updated student account register page to 2-column layout with emerald design"
   ```

7. **Push to remote:**
   ```bash
   git push origin main
   ```

---

## 🌿 Git Workflow (Best Practice)

### Option 1: Direct Push to Main (Simple)
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Option 2: Feature Branch (Better for teams)
```bash
# Create feature branch
git checkout -b feature/register-page-update

# Make changes, then commit
git add .
git commit -m "Updated register page layout"

# Push feature branch
git push origin feature/register-page-update

# Create Pull Request on GitHub/GitLab
# After review, merge to main
```

---

## ⚠️ Common Mistakes to Avoid

1. **Pushing .env files**
   - Check: `git status` should not show `.env`
   - Fix: Add to `.gitignore` and remove from git: `git rm --cached .env`

2. **Pushing node_modules or vendor**
   - These are HUGE and unnecessary
   - Should be in `.gitignore`

3. **Committing with generic messages**
   - ❌ Bad: "updates", "fixes", "changes"
   - ✅ Good: "Fixed register page layout to 2-column grid", "Updated copyright to dynamic year"

4. **Not testing before pushing**
   - Always test your changes locally first
   - Make sure Docker containers still work

---

## 🔄 Pulling Updates from Repo

When you clone or pull:

```bash
# Clone repository
git clone <your-repo-url>
cd integrated-system

# Copy environment files from examples
cp .env.example .env
cp main-system/laravel-backend/.env.example main-system/laravel-backend/.env
# ... repeat for all modules

# Edit .env files with actual values
nano .env

# Start Docker containers (will install dependencies automatically)
docker compose up -d
```

---

## ✅ Summary

**YES, push everything EXCEPT:**
- ❌ `.env` files
- ❌ `node_modules/` folders
- ❌ `vendor/` folders
- ❌ Database data
- ❌ Log files
- ❌ Build artifacts

**Your current .gitignore is good!** ✅

Just make sure to:
1. Check `git status` before pushing
2. Review what files are being committed
3. Never commit passwords or API keys
4. Use meaningful commit messages

You're good to push! 🚀

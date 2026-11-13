# 📋 Pre-Push Deployment Checklist

Use this checklist before pushing code to ensure smooth deployment on other machines.

---

## 🔍 Files & Configuration

### Environment Files
- [ ] Root `.env.example` exists and is up-to-date
- [ ] All module `.env.example` files exist:
  - [ ] `main-system/react-frontend/.env.example`
  - [ ] `main-system/laravel-backend/.env.example`
  - [ ] `staff_id_managament/frontend/.env.example`
  - [ ] `staff_id_managament/backend/.env.example`
  - [ ] `Student_print_module/frontend/.env.example`
  - [ ] `Student_print_module/backend/.env.example`
  - [ ] `Staff_Sticker_module/frontend/.env.example`
  - [ ] `Staff_Sticker_module/backend/.env.example`
  - [ ] `student_account_module/frontend/.env.example`
  - [ ] `student_account_module/backend/.env.example`

### Git Ignore Verification
- [ ] No `.env` files committed (only `.env.example`)
- [ ] No `vendor/` folders committed
- [ ] No `node_modules/` folders committed
- [ ] No `*.log` files committed
- [ ] No sensitive data (passwords, API keys) in code
- [ ] Check: `git status` shows clean working tree

---

## 🐳 Docker Configuration

### Docker Compose
- [ ] `compose.yaml` includes all services (6 backends + 6 frontends + mysql + phpmyadmin)
- [ ] All services have proper networking configured
- [ ] Volume mounts are correct
- [ ] Port mappings don't conflict
- [ ] Health checks configured (at least for MySQL)

### Dockerfiles
- [ ] All backend Dockerfiles present and working
- [ ] All frontend Dockerfiles present and working
- [ ] No hardcoded paths or credentials in Dockerfiles

### Initialization
- [ ] `mysql-init/01-init.sql` exists
- [ ] SQL script creates necessary databases
- [ ] SQL script doesn't contain sensitive data

---

## 📜 Migration Scripts

### Windows Script
- [ ] `migrate-all.cmd` exists
- [ ] Includes ALL module migrations:
  - [ ] Main System (creates base tables)
  - [ ] Staff ID Management
  - [ ] Student Account Module
  - [ ] Print Module
  - [ ] Sticker Module
- [ ] Proper error handling for each migration
- [ ] Correct order (Main System first, others can follow)

### Linux/Mac Script
- [ ] `migrate-all.sh` exists (if supporting Linux/Mac)
- [ ] Has proper permissions: `chmod +x migrate-all.sh`
- [ ] Same migration order as .cmd version

---

## 📚 Documentation

### Core Documentation
- [ ] `README.md` is current and accurate
- [ ] `SETUP_GUIDE.md` has step-by-step instructions
- [ ] `TROUBLESHOOTING.md` covers common issues
- [ ] All port numbers are correct in docs
- [ ] Database credentials match .env.example

### Module Documentation
- [ ] Each module has its own README (optional but helpful)
- [ ] API documentation is current (if applicable)
- [ ] Architecture diagrams updated (if applicable)

---

## 🧪 Local Testing

### Clean Slate Test
```bash
# 1. Stop and remove everything
docker compose down -v

# 2. Remove any local .env files temporarily
ren .env .env.backup

# 3. Fresh start
docker compose up -d

# 4. Wait for initialization (2-3 minutes)
timeout /t 120 /nobreak

# 5. Run migrations
migrate-all.cmd

# 6. Verify all services
docker compose ps
```

### Service Verification
- [ ] MySQL container is healthy
- [ ] phpMyAdmin accessible at http://localhost:8080
- [ ] Main System:
  - [ ] Backend: http://localhost:8000
  - [ ] Frontend: http://localhost:5173
- [ ] Staff ID Management:
  - [ ] Backend: http://localhost:8001
  - [ ] Frontend: http://localhost:5174
- [ ] Print Module:
  - [ ] Backend: http://localhost:8002
  - [ ] Frontend: http://localhost:5175
- [ ] Sticker Module:
  - [ ] Backend: http://localhost:8003
  - [ ] Frontend: http://localhost:5176
- [ ] Student Account:
  - [ ] Backend: http://localhost:8004
  - [ ] Frontend: http://localhost:5177

### Database Verification
```bash
# Check all tables exist
docker compose exec mysql mysql -u root -pRootPass123 business_center -e "SHOW TABLES;"
```

Expected tables should include:
- Base: users, cache, jobs, sessions
- Business: products, orders, payments
- Modules: print_orders, sticker_requests, staff_id_cards, etc.

### Frontend Verification
- [ ] All frontends load without console errors
- [ ] API connections work
- [ ] Module navigation works
- [ ] No CORS errors in browser console

---

## 🔐 Security Check

### Sensitive Data
- [ ] No passwords in committed code
- [ ] No API keys in committed code
- [ ] No database credentials except in .env.example
- [ ] Default passwords in .env.example are generic (not production passwords)

### .gitignore Coverage
```bash
# Verify these are NOT tracked:
git check-ignore .env
git check-ignore */backend/.env
git check-ignore */frontend/.env
git check-ignore */vendor
git check-ignore */node_modules
```

All should return the file path (meaning they're ignored) ✅

---

## 📦 Git Status

### Before Committing
```bash
# Check what will be committed
git status

# Review changes
git diff

# Check for large files (> 1MB)
git ls-files -s | awk '$4 > 1000000 {print $4, $2}'
```

### Commit Message
- [ ] Clear, descriptive commit message
- [ ] References issue/ticket if applicable
- [ ] Mentions major changes (e.g., "Add Sticker Module")

---

## 🚀 Final Steps

### Pre-Push
1. [ ] Run: `git pull origin main` (get latest changes)
2. [ ] Resolve any merge conflicts
3. [ ] Run local test again after merge
4. [ ] All tests passing

### Push
```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

### Post-Push Verification
- [ ] GitHub/GitLab shows all files
- [ ] No errors in CI/CD (if configured)
- [ ] Ask team member to test fresh clone

---

## 🎯 Quick Test on Another Machine

Have a colleague (or use another computer) test:

```bash
# 1. Fresh clone
git clone [repo-url]
cd integrated-system

# 2. Start services
docker compose up -d

# 3. Wait
# (First run: 2-3 minutes for dependencies)

# 4. Migrate
migrate-all.cmd

# 5. Test
# Open http://localhost:5173
```

**Success criteria:**
- ✅ All services start without errors
- ✅ Migrations complete successfully
- ✅ All frontends accessible
- ✅ No manual configuration needed (except optional .env customization)

---

## ⚠️ Common Issues

### Issue: "Variable is not set" warnings
**Fix:** This is normal without root `.env` file. Docker Compose uses .env.example defaults.

### Issue: "Port already in use"
**Fix:** 
```bash
docker compose down
# Change ports in .env or close conflicting applications
```

### Issue: "composer install" takes too long
**Expected:** First run takes 2-3 minutes per backend (5 backends = 10-15 min total on first startup)

### Issue: Frontend shows "Cannot connect to backend"
**Fix:** Wait longer - npm install may still be running
```bash
docker compose logs [frontend-service-name]
```

---

## 📝 Sign Off

Before pushing, confirm:

```
✅ All checkboxes above are complete
✅ Local clean-slate test passed
✅ Documentation is current
✅ No sensitive data committed
✅ Team is notified of changes

Date: ___________
Tested by: ___________
Ready to push: ✅
```

---

## 🆘 Need Help?

If checklist reveals issues:
1. Fix issues before pushing
2. Re-run checklist
3. Document any new issues in TROUBLESHOOTING.md

**Remember:** 10 minutes of checking now saves hours of debugging later! 🎯

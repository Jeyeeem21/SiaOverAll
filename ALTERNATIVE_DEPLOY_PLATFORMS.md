# Alternative Deployment Platforms

This guide covers deploying your integrated system to various cloud platforms via GitHub.

## 🐳 Docker Image Deployment (Universal)

The `build-and-push-docker.yml` workflow automatically builds and pushes Docker images to GitHub Container Registry. You can then deploy these images to any platform.

### Available Images

After pushing to GitHub, your images will be available at:
```
ghcr.io/<your-username>/integrated-system-main-backend:latest
ghcr.io/<your-username>/integrated-system-main-frontend:latest
ghcr.io/<your-username>/integrated-system-staff-id-backend:latest
ghcr.io/<your-username>/integrated-system-staff-id-frontend:latest
ghcr.io/<your-username>/integrated-system-print-backend:latest
ghcr.io/<your-username>/integrated-system-print-frontend:latest
ghcr.io/<your-username>/integrated-system-sticker-backend:latest
ghcr.io/<your-username>/integrated-system-sticker-frontend:latest
ghcr.io/<your-username>/integrated-system-account-backend:latest
ghcr.io/<your-username>/integrated-system-account-frontend:latest
```

---

## 1. 🚂 Railway (Recommended - Easiest)

### Why Railway?
- ✅ Free tier available
- ✅ Automatic SSL certificates
- ✅ Built-in MySQL database
- ✅ Easy environment variable management
- ✅ GitHub integration

### Setup (see GITHUB_DEPLOY_SETUP.md)
Railway deployment is fully documented in the main setup guide.

---

## 2. 🎨 Render

### Why Render?
- ✅ Free tier for web services
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL (you'll need to adapt)
- ✅ Easy to use dashboard

### Setup Instructions

1. **Create Render Account**: [render.com](https://render.com)

2. **Create MySQL Database** (or use external):
   - Use managed MySQL from PlanetScale, AWS RDS, or other provider
   - Or deploy MySQL on Render (paid)

3. **Create Web Services** (one for each component):

**Backend Services:**
```yaml
# render.yaml (create in root)
services:
  - type: web
    name: main-backend
    env: docker
    dockerfilePath: ./main-system/laravel-backend/Dockerfile.railway
    dockerContext: ./main-system/laravel-backend
    envVars:
      - key: APP_ENV
        value: production
      - key: APP_KEY
        generateValue: true
      - key: DB_CONNECTION
        value: mysql
      - key: DB_HOST
        fromDatabase:
          name: mysql-db
          property: host
      - key: DB_DATABASE
        fromDatabase:
          name: mysql-db
          property: database
      - key: DB_USERNAME
        fromDatabase:
          name: mysql-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: mysql-db
          property: password
  
  # Repeat for each backend service
  # - staff-id-backend
  # - print-backend
  # - sticker-backend
  # - account-backend

  - type: web
    name: main-frontend
    env: docker
    dockerfilePath: ./main-system/react-frontend/Dockerfile.railway
    dockerContext: ./main-system/react-frontend
    envVars:
      - key: VITE_API_URL
        value: https://main-backend.onrender.com/api
  
  # Repeat for each frontend service
```

4. **Connect GitHub**:
   - Go to Render Dashboard
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-deploy on push

---

## 3. ☁️ AWS (Amazon Web Services)

### Why AWS?
- ✅ Highly scalable
- ✅ Full control over infrastructure
- ⚠️ More complex setup
- ⚠️ Costs can add up

### Deployment Options

#### Option A: ECS (Elastic Container Service)
```yaml
# .github/workflows/deploy-aws-ecs.yml
name: Deploy to AWS ECS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          # Build and push each service
          docker build -t $ECR_REGISTRY/main-backend:latest -f main-system/laravel-backend/Dockerfile.railway main-system/laravel-backend
          docker push $ECR_REGISTRY/main-backend:latest
          # Repeat for all services
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster integrated-system --service main-backend --force-new-deployment
          # Repeat for all services
```

#### Option B: Elastic Beanstalk
1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init -p docker integrated-system`
3. Create environment: `eb create production`
4. Deploy: `eb deploy` (or automate with GitHub Actions)

---

## 4. 🔷 Azure (Microsoft)

### Why Azure?
- ✅ Good for enterprise
- ✅ Excellent .NET integration (but works for PHP/Node too)
- ⚠️ Complex pricing

### Using Azure Container Instances

```yaml
# .github/workflows/deploy-azure.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Build and push to ACR
        run: |
          az acr build --registry myregistry --image main-backend:latest --file main-system/laravel-backend/Dockerfile.railway main-system/laravel-backend
      
      - name: Deploy to Container Instances
        run: |
          az container create \
            --resource-group integrated-system-rg \
            --name main-backend \
            --image myregistry.azurecr.io/main-backend:latest \
            --dns-name-label main-backend-unique \
            --ports 8000
```

---

## 5. 🌊 DigitalOcean

### Why DigitalOcean?
- ✅ Simple pricing
- ✅ Good documentation
- ✅ App Platform (PaaS)

### Using App Platform

1. **Create `app.yaml`**:
```yaml
name: integrated-system

services:
  - name: main-backend
    github:
      repo: your-username/integrated-system
      branch: main
      deploy_on_push: true
    dockerfile_path: main-system/laravel-backend/Dockerfile.railway
    source_dir: main-system/laravel-backend
    http_port: 8000
    routes:
      - path: /
    envs:
      - key: APP_ENV
        value: production
  
  # Repeat for each service

databases:
  - name: mysql-db
    engine: MYSQL
    version: "8"
```

2. **Deploy**:
```bash
doctl apps create --spec app.yaml
```

Or use GitHub integration in DigitalOcean dashboard.

---

## 6. ☁️ Google Cloud Platform (GCP)

### Why GCP?
- ✅ Generous free tier
- ✅ Cloud Run (serverless containers)
- ✅ Good for scaling

### Using Cloud Run

```yaml
# .github/workflows/deploy-gcp.yml
name: Deploy to GCP Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Configure Docker
        run: gcloud auth configure-docker
      
      - name: Build and Push
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/main-backend:latest -f main-system/laravel-backend/Dockerfile.railway main-system/laravel-backend
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/main-backend:latest
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy main-backend \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/main-backend:latest \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

---

## 7. 🦊 Fly.io

### Why Fly.io?
- ✅ Great free tier
- ✅ Edge deployment
- ✅ Simple CLI

### Setup

1. **Install Fly CLI**:
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Create fly.toml** for each service:
```toml
# main-backend/fly.toml
app = "integrated-main-backend"

[build]
  dockerfile = "Dockerfile.railway"

[env]
  APP_ENV = "production"

[[services]]
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

3. **Deploy**:
```bash
fly deploy
```

4. **Automate with GitHub Actions**:
```yaml
- name: Deploy to Fly.io
  uses: superfly/flyctl-actions/setup-flyctl@master
- run: flyctl deploy --remote-only
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## 🔄 Comparison Table

| Platform | Free Tier | Ease of Use | Scaling | Cost |
|----------|-----------|-------------|---------|------|
| **Railway** | ✅ $5/month free | ⭐⭐⭐⭐⭐ | Good | $$ |
| **Render** | ✅ Yes (limited) | ⭐⭐⭐⭐⭐ | Good | $$ |
| **Heroku** | ❌ No longer free | ⭐⭐⭐⭐ | Good | $$$ |
| **AWS** | ✅ Limited | ⭐⭐ | Excellent | $ - $$$ |
| **Azure** | ✅ Limited | ⭐⭐ | Excellent | $$ - $$$ |
| **GCP** | ✅ Generous | ⭐⭐⭐ | Excellent | $$ |
| **DigitalOcean** | ❌ No | ⭐⭐⭐⭐ | Good | $$ |
| **Fly.io** | ✅ Good | ⭐⭐⭐⭐ | Good | $ |

---

## 🎯 Recommendation

**For your integrated system (10 services), I recommend:**

1. **Railway** - Best balance of ease-of-use and features
2. **Render** - Good alternative if you want more free tier
3. **Fly.io** - If you need edge deployment
4. **AWS/GCP** - If you need enterprise-grade scaling

---

## 📝 Next Steps

1. Choose your platform
2. Follow the specific setup guide above
3. Configure GitHub secrets for your chosen platform
4. Push to `main` branch to trigger automatic deployment
5. Monitor deployment in GitHub Actions tab

---

## 🆘 Support

Each platform has excellent documentation:
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [AWS Docs](https://docs.aws.amazon.com)
- [Azure Docs](https://docs.microsoft.com/azure)
- [GCP Docs](https://cloud.google.com/docs)
- [DigitalOcean Docs](https://docs.digitalocean.com)
- [Fly.io Docs](https://fly.io/docs)


# CI/CD Pipeline Setup Guide

## Overview
Workflow ini mengotomasi build, test, dan push Docker image ke GitHub Container Registry (GHCR), serta trigger deployment ke PaaS platform.

## Workflow Triggers
- ✅ Push ke branch `main`
- ✅ Pull Request ke branch `main` (build only, no push)

## Jobs

### 1. build-test-deploy
Langkah utama:
- Checkout code
- Setup Node.js 20
- Install dependencies
- Run linter (optional)
- Run tests (optional)
- Build Docker image
- Push ke GHCR dengan tag `latest`

### 2. deploy-to-paas
Hanya jalan setelah `build-test-deploy` berhasil dan pada push ke `main`:
- Trigger webhook ke PaaS platform untuk deploy

## Required Secrets

Configure secrets di GitHub Repository Settings → Secrets and variables → Actions:

### 1. PAAS_WEBHOOK_URL (Required untuk deployment)
URL endpoint PaaS yang akan trigger deployment.

**Format:**
```
https://your-paas-platform.com/webhook/deploy
```

**Cara set di GitHub:**
1. Go to: `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Name: `PAAS_WEBHOOK_URL`
4. Value: Paste webhook URL dari PaaS provider

### 2. PAAS_WEBHOOK_TOKEN (Optional, untuk auth)
Token/API key untuk authenticate ke PaaS webhook (jika diperlukan).

**Cara set:**
1. Do same as above
2. Name: `PAAS_WEBHOOK_TOKEN`
3. Value: Paste token dari PaaS

### 3. GITHUB_TOKEN (Automatic)
GitHub secara otomatis provide token ini, jadi tidak perlu manual setup.

## Automatic GHCR Access
Token untuk push ke GHCR di-handle oleh `secrets.GITHUB_TOKEN` yang disediakan GitHub secara otomatis.

Tidak perlu setup manual!

## Image Naming Convention

Image akan di-push ke GHCR dengan format:
```
ghcr.io/D4marp/backend_lamtek:latest
```

**Important:** Repository name di-lowercase otomatis (GHCR requirement).

## GitHub Container Registry Access

Setelah push berhasil, image accessible di:
```
ghcr.io/d4marp/backend_lamtek:latest
```

### Pull image (authenticated):
```bash
docker login ghcr.io
docker pull ghcr.io/d4marp/backend_lamtek:latest
```

### Pull image (with token):
```bash
docker pull ghcr.io/d4marp/backend_lamtek:latest \
  -u username:github_token
```

## Workflow Status

Lihat status workflow di:
- **GitHub UI:** Repository → `Actions` tab
- Setiap push akan trigger workflow
- Status bisa dilihat di PR atau commit detail

## Troubleshooting

### Workflow Failed
1. Check `Actions` tab untuk error details
2. Verify repository secrets sudah set
3. Check Docker build logs

### Push to GHCR Failed
- Verify `GITHUB_TOKEN` permission (should be automatic)
- Check Docker image naming convention

### PaaS Deployment Failed
- Verify `PAAS_WEBHOOK_URL` benar
- Check PaaS provider logs
- Verify `PAAS_WEBHOOK_TOKEN` jika required

## Example Webhook Payload

PaaS akan terima JSON payload:
```json
{
  "image": "ghcr.io/d4marp/backend_lamtek:latest",
  "timestamp": "2024-04-05T12:30:00Z"
}
```

## Skipping Deployment

Jika ingin skip deployment untuk push tertentu, add ke commit message:
```
[skip deploy]
```

Atau comment `skip-deploy` dalam workflow file.

## Next Steps

1. **Set PaaS Webhook Secrets**
   - Go to Settings → Secrets
   - Add `PAAS_WEBHOOK_URL`
   - Add `PAAS_WEBHOOK_TOKEN` (if needed)

2. **Test Workflow**
   - Make commit dan push ke main
   - Check Actions tab untuk status
   - Verify image pushed to GHCR

3. **Monitor Deployments**
   - Check GitHub Actions for build status
   - Check PaaS platform untuk deploy status

## Security Best Practices

✅ **Do:**
- Keep webhook URL dan token secret
- Use GitHub secrets for sensitive data
- Review workflow before major changes

❌ **Don't:**
- Commit secrets ke repository
- Share webhook URLs publicly
- Use weak tokens

## Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Container Registry Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Build Push Action](https://github.com/docker/build-push-action)

# Deploy Registry Online for Team Access

## Option 1: Cloud Deployment (Recommended)

### A. Deploy to Railway/Render/Heroku

```bash
# Create Dockerfile
FROM verdaccio/verdaccio:5
COPY verdaccio-config.yaml /verdaccio/conf/config.yaml
EXPOSE 4873
```

### B. Deploy to VPS/Server

```bash
# Install on server
npm install -g verdaccio pm2

# Start with PM2
pm2 start verdaccio --name "npm-registry"
pm2 startup
pm2 save

# Configure nginx proxy
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:4873;
        proxy_set_header Host $host;
    }
}
```

## Option 2: Quick Online Setup

### Using ngrok (Instant)

```bash
# Install ngrok
npm install -g ngrok

# Expose local registry
ngrok http 4873
# Share the https URL with team
```

### Using GitHub Packages (Free)

```bash
# Configure for GitHub


# Update all package.json files
"publishConfig": {
  "registry": "https://npm.pkg.github.com"
}
```

## Option 3: Docker Deployment

### Create docker-compose.yml

```yaml
version: "3"
services:
  verdaccio:
    image: verdaccio/verdaccio:5
    ports:
      - "4873:4873"
    volumes:
      - ./verdaccio-config.yaml:/verdaccio/conf/config.yaml
      - verdaccio-storage:/verdaccio/storage
    restart: unless-stopped
volumes:
  verdaccio-storage:
```

## Team Usage Instructions

### For teammates:

```bash
# Configure registry
npm config set @system:registry https://your-registry-url

# Install packages
npm install @system/core @system/monitoring

# Or use .npmrc file
echo "@system:registry=https://your-registry-url" >> .npmrc
```

## Recommended: Railway Deployment (5 minutes)

1. Push code to GitHub
2. Connect to Railway.app
3. Deploy with one click
4. Get public URL
5. Share with team

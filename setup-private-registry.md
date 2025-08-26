# Setting Up Private NPM Registry

## Option 1: Verdaccio (Recommended - Free & Easy)

### Install Verdaccio
```bash
npm install -g verdaccio
```

### Start Registry
```bash
verdaccio
# Registry will run on http://localhost:4873
```

### Configure for Production
```bash
# Create config directory
mkdir ~/.config/verdaccio

# Edit config file
nano ~/.config/verdaccio/config.yaml
```

### Basic config.yaml:
```yaml
storage: ./storage
auth:
  htpasswd:
    file: ./htpasswd
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
packages:
  '@system/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs
listen: 0.0.0.0:4873
```

## Option 2: GitHub Packages (Free for private repos)

### Setup
1. Create GitHub organization/repo
2. Generate Personal Access Token with `write:packages` scope
3. Configure npm:

```bash
npm config set @system:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN
```

## Option 3: AWS CodeArtifact

### Setup
```bash
aws codeartifact create-domain --domain creo
aws codeartifact create-repository --domain creo --repository system-packages
aws codeartifact login --tool npm --domain creo --repository system-packages
```

## Quick Start with Verdaccio

### 1. Install & Start
```bash
npm install -g verdaccio
verdaccio
```

### 2. Create User
```bash
npm adduser --registry http://localhost:4873
```

### 3. Update Your Config
```bash
npm config set @system:registry http://localhost:4873
```
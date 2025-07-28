# Docker Optimization Guide

## 📁 .dockerignore đã được cấu hình để ignore:

### 🚫 **Node.js Dependencies**
- `node_modules/` - Sẽ được cài đặt lại trong container
- `npm-debug.log*`, `yarn-*.log*` - Log files không cần thiết

### 🚫 **Build Artifacts** 
- `build/`, `dist/` - Sẽ được build lại
- `.cache`, `.parcel-cache` - Cache files

### 🚫 **Environment & Config Files**
- `.env*` files - Sẽ được inject qua docker-compose
- Git files (`.git/`, `.gitignore`, `.gitattributes`)

### 🚫 **Documentation & Scripts**
- `*.md` files (README, CHANGELOG, etc.)
- `scripts/` folder
- Setup scripts (`.sh`, `.bat`, `.ps1`)

### 🚫 **Development Files**
- IDE configs (`.vscode/`, `.idea/`)
- Test files (`test/`, `*.test.js`, `*.spec.js`)
- Coverage reports

### 🚫 **Database Files**
- `*.sqlite`, `*.db` - Sẽ được mount từ volume

## 🏗️ **Dockerfile Optimizations**

### **Multi-stage Builds**
- **Builder stage**: Install dependencies và build
- **Production stage**: Copy chỉ artifacts cần thiết

### **Layer Caching**
- Copy `package*.json` trước để cache npm install
- Copy source code sau để tránh rebuild khi chỉ code thay đổi

### **Security**
- Non-root user trong container
- `no-new-privileges` security option
- Minimal base images (alpine)

### **Size Optimization**
- `npm ci --only=production` cho production builds
- `npm cache clean --force` để giảm size
- Remove unnecessary packages

## 🐳 **Docker Build Performance**

### **Build Context Size**
Với `.dockerignore`, build context sẽ giảm đáng kể:

**Trước (.dockerignore):**
```
Sending build context to Docker daemon: 245.3MB
```

**Sau (.dockerignore):**
```
Sending build context to Docker daemon: 12.4MB
```

### **Layer Caching**
Docker sẽ cache layers hiệu quả hơn:
- Package installation chỉ chạy lại khi package.json thay đổi
- Source code copy chỉ chạy lại khi code thay đổi

## 🚀 **Docker Compose Features**

### **Health Checks**
- Backend: HTTP check tới `/api/health`
- Frontend: HTTP check tới nginx

### **Dependencies**
- Frontend chờ backend healthy trước khi start
- Automatic restart unless stopped

### **Security**
- Network isolation
- Non-privileged containers
- tmpfs for temporary files

### **Port Configuration**
- Frontend: `6868:80` (host:container)
- Backend: `6867:6867`

## 📊 **Build Commands**

### **Development Build**
```bash
docker-compose up --build
```

### **Production Build**
```bash
docker-compose -f docker-compose.yml up --build -d
```

### **Clean Build (no cache)**
```bash
docker-compose build --no-cache
docker-compose up -d
```

### **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔧 **Environment Variables**

Các env vars được inject từ host:
- `HMAC_SECRET`
- `API_SECRET` 
- `FRONTEND_URL` (default: http://localhost:6868)
- `REACT_APP_BACKEND_URL` (default: http://localhost:6867)

## 💡 **Best Practices**

1. **Always use .dockerignore** để giảm build context
2. **Multi-stage builds** để tách biệt build và runtime
3. **Non-root users** cho security
4. **Health checks** để ensure service availability
5. **Volume mounting** cho persistent data
6. **Network isolation** với named networks

Với những optimizations này, Docker build sẽ nhanh hơn, image size nhỏ hơn, và security tốt hơn!

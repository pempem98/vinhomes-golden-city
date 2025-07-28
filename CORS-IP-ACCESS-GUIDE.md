# CORS & IP Access Control Configuration

## 🔒 **Security Overview**

Vinhomes Golden City Dashboard hỗ trợ kiểm soát truy cập linh hoạt thông qua environment variables để quản lý CORS origins và IP access.

**📝 Note**: Development `.env` files are included in the repository for quick setup. For production, always use secure, unique values!

## ⚙️ **Environment Variables**

### **CORS Configuration**

```bash
# Allow all origins (*) - USE WITH CAUTION IN PRODUCTION
ALLOW_ALL_ORIGINS=true

# Specific origins (comma-separated) - used when ALLOW_ALL_ORIGINS=false  
CORS_ORIGINS=http://localhost:6868,https://your-domain.com,https://your-cdn.com
```

### **IP Access Control**

```bash
# Allow all IPs (*) - USE WITH CAUTION IN PRODUCTION
ALLOW_ALL_IPS=true

# Specific IPs (comma-separated) - used when ALLOW_ALL_IPS=false
ALLOWED_IPS=127.0.0.1,::1,192.168.1.0/24,your-server-ip
```

## 🚀 **Usage Examples**

### **Development Mode (Recommended)**
```bash
# .env
ALLOW_ALL_ORIGINS=true
ALLOW_ALL_IPS=true
NODE_ENV=development
```

### **Production Mode - Secure**
```bash
# .env
ALLOW_ALL_ORIGINS=false
CORS_ORIGINS=https://your-domain.com,https://your-cdn.com
ALLOW_ALL_IPS=false
ALLOWED_IPS=your-server-ip,your-cdn-ip
NODE_ENV=production
```

### **Production Mode - Open Access (⚠️ Use with caution)**
```bash
# .env
ALLOW_ALL_ORIGINS=true
ALLOW_ALL_IPS=true
NODE_ENV=production
```

## 📊 **Server Startup Logs**

The server will display current configuration on startup:

### **Development Mode**
```
🚀 Vinhomes Golden City Server running on port 6867
✅ CORS: All origins allowed (*) - Development mode
🌍 IP Access: All IPs allowed (*) - Development mode
```

### **Production Mode - Secure**
```
🚀 Vinhomes Golden City Server running on port 6867
🔒 CORS: Restricted to specific origins
   Origins: https://your-domain.com, https://your-cdn.com
🔐 IP Access: Restricted to specific IPs
   Allowed IPs: your-server-ip, your-cdn-ip
```

### **Production Mode - Open Access (⚠️ Warning)**
```
🚀 Vinhomes Golden City Server running on port 6867
✅ CORS: All origins allowed (*) - ⚠️ PRODUCTION MODE
🌍 IP Access: All IPs allowed (*) - ⚠️ PRODUCTION MODE
⚠️ WARNING: Production mode with open access policies detected!
   Consider restricting CORS and IP access for security.
```

## 🐳 **Docker Configuration**

In `docker-compose.yml`, these variables are configurable:

```yaml
environment:
  - ALLOW_ALL_ORIGINS=${ALLOW_ALL_ORIGINS:-false}
  - CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:6868}
  - ALLOW_ALL_IPS=${ALLOW_ALL_IPS:-false}  
  - ALLOWED_IPS=${ALLOWED_IPS:-127.0.0.1,::1}
```

## 🔐 **Security Best Practices**

### **✅ Recommended for Production**
- Set `ALLOW_ALL_ORIGINS=false` and specify exact domains
- Set `ALLOW_ALL_IPS=false` and whitelist specific server IPs
- Use HTTPS in production
- Regularly review and update allowed origins/IPs

### **⚠️ Use with Caution**
- `ALLOW_ALL_ORIGINS=true` in production (opens to all domains)
- `ALLOW_ALL_IPS=true` in production (no IP restrictions)
- HTTP in production (not secure)

### **🚫 Never Do**
- Expose admin endpoints without IP restrictions
- Use default secrets in production
- Mix development and production configurations

## 🛡️ **IP Access Control Details**

The server checks client IPs in this order:
1. `x-forwarded-for` header (for load balancers/proxies)
2. `req.ip` (Express trusted proxy)
3. `req.connection.remoteAddress` (direct connection)

Blocked requests return:
```json
{
  "error": "Access denied from this IP address"
}
```

## 🔧 **Troubleshooting**

### **CORS Errors**
- Verify `CORS_ORIGINS` includes your frontend domain
- Check browser network tab for actual origin being sent
- Ensure protocol (http/https) matches exactly

### **IP Access Denied**
- Check server logs for actual client IP: `🚫 Access denied from IP: x.x.x.x`
- Add the IP to `ALLOWED_IPS` or set `ALLOW_ALL_IPS=true`
- Consider proxy/load balancer IP forwarding

This configuration provides flexible security control while maintaining ease of development! 🚀

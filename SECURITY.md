# Real Estate Dashboard Security Guide

## Hiện tại các lỗ hổng bảo mật đã được phát hiện:

### 🚨 Lỗ hổng nghiêm trọng:
1. **Không có xác thực**: API webhook hoàn toàn mở
2. **Không validate dữ liệu**: Chấp nhận bất kỳ input nào
3. **Thiếu rate limiting**: Có thể bị DDoS
4. **Logging không an toàn**: Log toàn bộ request data
5. **CORS quá rộng**: Cho phép nhiều domain

## ✅ Các biện pháp bảo mật đã được triển khai:

### 1. Webhook Authentication
- HMAC-SHA256 signature verification
- Timestamp validation để chống replay attacks
- Secret key để xác thực request từ Google Apps Script

### 2. Input Validation
- Validate tất cả các field required
- Kiểm tra data type và range
- Sanitize string inputs
- Whitelist status values

### 3. Rate Limiting
- Giới hạn 100 requests/15 phút per IP
- Middleware tự động cleanup memory

### 4. Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection
- Strict-Transport-Security
- Content-Security-Policy

### 5. Enhanced Logging
- Không log sensitive data
- Request tracking với IP và timestamp
- Error logging với rotation

## 🔧 Cài đặt:

### Backend:
1. Thêm secret key vào environment variables:
```bash
export WEBHOOK_SECRET="your-very-secure-secret-key-here"
```

2. Update server.js để sử dụng security middleware

3. Restart server

### Google Apps Script:
1. Thay thế `onEditTrigger.gs` bằng `onEditTrigger-secure.gs`
2. Cập nhật `WEBHOOK_SECRET` trong script (phải giống backend)
3. Cập nhật `WEBHOOK_URL` với URL thực của server
4. Deploy lại script

## 🔍 Kiểm tra bảo mật:

### Test Authentication:
```bash
# Test without signature (should fail)
curl -X POST http://localhost:5000/api/update-sheet \
  -H "Content-Type: application/json" \
  -d '{"apartment_id":"TEST01","agency":"Test"}'

# Test with invalid signature (should fail)  
curl -X POST http://localhost:5000/api/update-sheet \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: invalid" \
  -H "X-Webhook-Timestamp: $(date +%s)" \
  -d '{"apartment_id":"TEST01","agency":"Test"}'
```

### Test Rate Limiting:
```bash
# Send 101 requests rapidly (should be rate limited)
for i in {1..101}; do
  curl -X POST http://localhost:5000/api/update-sheet
done
```

## ⚠️ Lưu ý quan trọng:

1. **Secret Key**: Phải dài ít nhất 32 characters, random, và giữ bí mật
2. **HTTPS**: Luôn sử dụng HTTPS trong production
3. **IP Whitelist**: Nên thêm whitelist cho Google Apps Script IPs
4. **Monitoring**: Setup monitoring để phát hiện các request bất thường
5. **Backup**: Regular backup database và logs

## 📝 Recommendation tiếp theo:

1. **Database Encryption**: Encrypt sensitive data in database
2. **API Versioning**: Version API để maintain backward compatibility
3. **Audit Trail**: Log tất cả các thay đổi data với user info
4. **Health Checks**: Implement health check endpoints
5. **Error Handling**: Centralized error handling và alerting

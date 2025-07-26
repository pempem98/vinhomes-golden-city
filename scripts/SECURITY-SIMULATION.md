# Secure Simulation Scripts

Tôi đã tạo các phiên bản secure cho cả hai scripts simulate:

## 🔒 Secure Scripts

### 1. `simulate-live-updates-secure.js`
- **HMAC-SHA256 Authentication**: Mọi request đều được sign
- **Input Validation**: Validate dữ liệu trước khi gửi
- **Retry Logic**: Tự động retry khi gặp lỗi network
- **Error Handling**: Comprehensive error tracking
- **Environment Variables**: Support cho WEBHOOK_SECRET và BACKEND_URL
- **Rate Statistics**: Track success/failure rates

### 2. `simulate-status-changes-secure.js`  
- **Authentication**: Tương tự secure live updates
- **Mock Data**: Sử dụng mock data thay vì unsecured API calls
- **Status Validation**: Validate status transitions
- **Graceful Shutdown**: Handle SIGINT properly
- **Connection Retry**: Retry logic cho network failures

## 🚨 Vấn đề bảo mật của scripts cũ:

### `simulate-live-updates.js`:
1. **Không có authentication** - Gửi raw HTTP requests
2. **Không validate input** - Có thể gửi invalid data
3. **Hardcoded URLs** - Không flexible cho environments khác nhau
4. **No error handling** - Không track success/failure rates
5. **Unsafe logging** - Log toàn bộ response data

### `simulate-status-changes.js`:
1. **Insecure API calls** - Calls GET `/api/apartments` without auth
2. **Assumption-based updates** - Assumes PUT endpoint exists
3. **No data validation** - Doesn't validate before sending
4. **Simple error handling** - Basic error messages only

## ✅ Cải thiện bảo mật:

### Authentication & Authorization:
- HMAC-SHA256 signature cho mọi request
- Timestamp validation chống replay attacks
- User-Agent headers để identify legitimate requests

### Input Validation:
- Validate apartment_id, agency, area, price, status
- Check data types và ranges
- Sanitize string inputs to prevent injection

### Network Security:
- Timeout configurations (5 seconds)
- Retry logic với exponential backoff
- Proper error classification (4xx vs 5xx)

### Environment Security:
- Support environment variables cho secrets
- Warning khi sử dụng default secrets
- Flexible backend URL configuration

### Monitoring & Logging:
- Success/failure rate tracking
- Safe logging without sensitive data
- Graceful shutdown handling

## 🛠️ Cách sử dụng:

### Setup Environment:
```bash
export WEBHOOK_SECRET="your-very-secure-secret-key-here"
export BACKEND_URL="http://localhost:5000"
```

### Install Dependencies:
```bash
cd scripts
npm install axios
```

### Run Secure Simulations:
```bash
# Secure live updates
node simulate-live-updates-secure.js

# Secure status changes  
node simulate-status-changes-secure.js
```

## 🔧 Backend Requirements:

Scripts này yêu cầu backend đã implement:
1. **Authentication middleware** (`auth.js`)
2. **Enhanced server.js** với security headers
3. **WEBHOOK_SECRET** environment variable

## 📊 Monitoring Output:

Scripts mới sẽ show:
- Real-time success/failure counts
- Authentication status
- Network retry attempts
- Validation errors
- Final statistics

## ⚠️ Lưu ý:

1. **Không chạy song song** các scripts cũ và mới
2. **Test thoroughly** trước khi production
3. **Monitor logs** để detect any issues
4. **Update secrets** regularly
5. **Use HTTPS** trong production environment

Cả hai scripts secure này đã loại bỏ hoàn toàn các lỗ hổng bảo mật của phiên bản cũ!

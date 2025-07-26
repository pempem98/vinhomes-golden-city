# Status Update - Cập nhật 3 Trạng thái Chính ✅

## 📋 **Trạng thái mới được chuẩn hóa:**

1. **"Sẵn hàng"** (AVAILABLE) - Căn hộ có sẵn để bán
2. **"Đang lock"** (LOCK) - Căn hộ đang được giữ chỗ  
3. **"Đã bán"** (SOLD) - Căn hộ đã được bán (trạng thái cuối)

## 🔄 **Files đã được cập nhật:**

### **Backend:**
- ✅ `backend/src/auth.js` → Validation middleware
  - Updated `validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán']`

### **Google Apps Script:**
- ✅ `google-apps-script/onEditTrigger.gs` → Input validation
  - Updated `validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán']`

### **Simulation Scripts:**
- ✅ `scripts/simulate-live-updates.js` → Live updates simulation
  - Updated validation, generation, and status transitions
  - Status distribution: 60% "Sẵn hàng", 25% "Đang lock", 15% "Đã bán"
  - Transition rules: Sẵn hàng → Đang lock → (Đã bán | Sẵn hàng)

- ✅ `scripts/simulate-status-changes.js` → Status changes simulation  
  - Updated validation and mock data
  - Updated status transition logic

### **Frontend:**
- ✅ `frontend/src/locales/vi.js` → Vietnamese translations
  - Updated status labels and statusLabels
  - "available": "Sẵn hàng" (was "Sẵn hàng")

- ✅ `frontend/src/locales/en.js` → English translations
  - Updated status labels and statusLabels
  - "available": "Available" (was "Ready")

- ✅ `frontend/src/locales/index.js` → Status mapping logic
  - Updated status mapping functions
  - Added "Sẵn hàng" case to status functions

## 🔄 **Status Transition Logic:**

```
Sẵn hàng (AVAILABLE) 
    ↓ (70% chance)
Đang lock (LOCK)
    ↓ (40% chance to sell, 30% back to available)
Đã bán (SOLD) ← Final state
```

## 📊 **Status Distribution:**
- **60%** → Sẵn hàng (AVAILABLE)
- **25%** → Đang lock (LOCK)  
- **15%** → Đã bán (SOLD)

## 🎯 **Status Display:**

### **Grid View:**
- 🟢 Sẵn hàng: Green background
- 🟡 Đang lock: Yellow background with "LOCK" label
- 🔴 Đã bán: Red background with "SOLD" label

### **List View:**
- Sẵn hàng: Normal text
- Đang lock: "Đang lock" 
- Đã bán: "Đã bán"

## 🛡️ **Validation Rules:**

### **Backend Validation:**
```javascript
const validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán'];
```

### **Frontend Mapping:**
```javascript
if (normalizedStatus === 'Sẵn hàng') return t('status.available');
if (normalizedStatus === 'Đang lock') return t('status.locked'); 
if (normalizedStatus === 'Đã bán') return t('status.sold');
```

### **Google Apps Script:**
```javascript
const validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán'];
```

## 🧪 **Testing:**

### **Test Data Examples:**
```javascript
// Valid statuses
{ apartment_id: 'TH2-06', status: 'Sẵn hàng' }   ✅
{ apartment_id: 'TH8-54', status: 'Đang lock' }  ✅  
{ apartment_id: 'AS10-109', status: 'Đã bán' }   ✅

// Invalid statuses (will be rejected)
{ apartment_id: 'TEST', status: 'Còn trống' }    ❌
{ apartment_id: 'TEST', status: 'Đã thuê' }      ❌
{ apartment_id: 'TEST', status: 'Không còn' }    ❌
```

### **Verification Commands:**
```bash
# Test with correct statuses
node scripts/simulate-live-updates.js
node scripts/simulate-status-changes.js

# Backend will validate and accept only:
# "Sẵn hàng", "Đang lock", "Đã bán"
```

## ✅ **Status: FULLY UPDATED**

Tất cả components trong hệ thống đã được cập nhật để sử dụng đúng 3 trạng thái:
- **Sẵn hàng** (AVAILABLE)
- **Đang lock** (LOCK) 
- **Đã bán** (SOLD)

Hệ thống bây giờ sẽ reject bất kỳ trạng thái nào khác và chỉ chấp nhận 3 trạng thái này!

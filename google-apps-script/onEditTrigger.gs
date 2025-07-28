/**
 * Enhanced Google Apps Script with Security
 * This script includes signature verification and better error handling
 */

// Replace with your actual backend URL and secret key
const WEBHOOK_URL = 'https://vinhomes-golden-city.real-estate.io.vn/api/update-sheet';
const WEBHOOK_SECRET = 'dev-webhook-secret-change-in-production'; // Must match backend

/**
 * Generate HMAC signature for webhook security
 */
function generateSignature(timestamp, payload) {
  const message = timestamp + payload;
  const signature = Utilities.computeHmacSignature(
    Utilities.MacAlgorithm.HMAC_SHA_256,
    message,
    WEBHOOK_SECRET,
    Utilities.Charset.UTF_8
  );
  return signature.reduce((str, chr) => {
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length == 1 ? '0' : '') + chr;
  }, '');
}

/**
 * Tạo một menu tùy chỉnh trên giao diện của trang tính khi file được mở.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createMenu('⚙️ Công cụ Đồng bộ')
      .addItem('Đồng bộ Tất cả Dữ liệu', 'syncAllDataSecure')
      .addItem('Xóa căn hoặc toàn bộ', 'deleteApartmentPrompt')
      .addToUi();
}

/**
 * Prompt user for apartment ID or 'all', then call backend API to delete
 */
function deleteApartmentPrompt() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt('Xóa căn', 'Nhập mã căn muốn xóa hoặc "all" để xóa toàn bộ:', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return;
  var input = response.getResponseText().trim();
  if (!input) {
    ui.alert('Bạn chưa nhập mã căn hoặc "all".');
    return;
  }
  var confirm = ui.alert('Xác nhận',
    input.toLowerCase() === 'all' ?
      'Bạn chắc chắn muốn xóa TOÀN BỘ dữ liệu? Hành động này không thể hoàn tác!' :
      'Bạn chắc chắn muốn xóa căn: ' + input + '?',
    ui.ButtonSet.YES_NO);
  if (confirm !== ui.Button.YES) return;
  deleteApartmentApi(input);
}

/**
 * Call backend API to delete apartment or all
 */
function deleteApartmentApi(idOrAll) {
  try {
    var url = idOrAll.toLowerCase() === 'all'
      ? 'https://vinhomes-golden-city.real-estate.io.vn/api/apartment'
      : 'https://vinhomes-golden-city.real-estate.io.vn/api/apartment/' + encodeURIComponent(idOrAll);
    var options = {
      method: 'delete',
      headers: {
        'X-Admin-Secret': 'dev-admin-secret', // Đổi secret cho production nếu cần
        'User-Agent': 'GoogleAppsScript-RealEstateDashboard/1.0'
      },
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var text = response.getContentText();
    if (code >= 200 && code < 300) {
      SpreadsheetApp.getUi().alert('Đã xóa thành công!');
    } else {
      SpreadsheetApp.getUi().alert('Lỗi xóa: ' + code + '\n' + text);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('Lỗi gọi API: ' + e);
  }
}

/**
 * Enhanced handleEdit trigger with security
 */
function handleEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    
    // Only process edits on the main data sheet
    if (sheet.getName() !== 'Vinhomes Duong Kinh') {
      console.log('Edit not on main sheet, ignoring...');
      return;
    }
    
    const editedRow = range.getRow();
    
    // Skip header row
    if (editedRow <= 1) {
      console.log('Header row edited, ignoring...');
      return;
    }
    
    // Get row data with validation
    const rowData = sheet.getRange(editedRow, 1, 1, 6).getValues()[0];
    
    // Validate and create payload
    const payload = {
      apartment_id: String(rowData[0] || '').trim(),
      agency: String(rowData[1] || '').trim(),
      agency_short: String(rowData[2] || '').trim(),
      area: parseFloat(rowData[3]) || 0,
      price: parseFloat(rowData[4]) || 0,
      status: String(rowData[5] || '').trim()
    };
    console.log('Row Data: ', rowData);
    
    // Validate required fields
    if (!payload.apartment_id) {
      console.log('No apartment ID found, skipping update...');
      return;
    }
    
    if (!payload.agency) {
      console.log('No agency found, skipping update...');
      return;
    }
    
    // Validate ranges
    if (payload.area < 0 || payload.area > 1000) {
      console.log('Invalid area value:', payload.area);
      return;
    }
    
    if (payload.price < 0 || payload.price > 1000) {
      console.log('Invalid price value:', payload.price);
      return;
    }
    
    const validStatuses = ['Sẵn hàng', 'Đang lock', 'Đã bán'];
    if (payload.status && !validStatuses.includes(payload.status)) {
      console.log('Invalid status:', payload.status);
      return;
    }
    
    console.log('Sending secure update for apartment:', payload);
    
    // Send authenticated request
    sendSecureWebhook(payload);
    
  } catch (error) {
    console.error('Error in onEdit trigger:', error.toString());
    
    // Log to spreadsheet for debugging (optional)
    logError(e.source, error, 'onEdit');
  }
}

/**
 * Send authenticated webhook request
 */
function sendSecureWebhook(payload) {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(timestamp, payloadString);
    
    const options = {
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp,
        'User-Agent': 'GoogleAppsScript-RealEstateDashboard/1.0'
      },
      payload: payloadString,
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      console.log('Successfully sent authenticated data to backend');
      console.log('Response:', responseText);
    } else {
      console.error('Error response from backend:', responseCode, responseText);
      
      // Retry logic for temporary failures
      if (responseCode >= 500 && responseCode < 600) {
        console.log('Server error, will retry in 5 seconds...');
        Utilities.sleep(5000);
        
        // Single retry attempt
        const retryResponse = UrlFetchApp.fetch(WEBHOOK_URL, options);
        if (retryResponse.getResponseCode() >= 200 && retryResponse.getResponseCode() < 300) {
          console.log('Retry successful');
        } else {
          console.error('Retry failed:', retryResponse.getResponseCode(), retryResponse.getContentText());
        }
      }
    }
    
  } catch (error) {
    console.error('Error sending webhook:', error.toString());
  }
}

/**
 * Enhanced test function with authentication
 */
function testSecureWebhook() {
  const testPayload = {
    apartment_id: 'TEST01',
    agency: 'Test Agency',
    agency_short: "TA",
    area: 85.5,
    price: 6.2,
    status: 'Đang lock'
  };
  
  console.log('Testing secure webhook with payload:', JSON.stringify(testPayload));
  sendSecureWebhook(testPayload);
}

/**
 * Log errors to a separate sheet for monitoring
 */
function logError(spreadsheet, error, source) {
  try {
    let errorSheet = spreadsheet.getSheetByName('Errors');
    
    if (!errorSheet) {
      errorSheet = spreadsheet.insertSheet('Errors');
      errorSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Source', 'Error', 'Stack']]);
    }
    
    const timestamp = new Date().toISOString();
    errorSheet.appendRow([timestamp, source, error.toString(), error.stack || 'N/A']);
    
    // Keep only last 100 error logs
    if (errorSheet.getLastRow() > 101) {
      errorSheet.deleteRows(2, errorSheet.getLastRow() - 101);
    }
    
  } catch (logError) {
    console.error('Error logging to sheet:', logError.toString());
  }
}

/**
 * Enhanced sync function with authentication and batching
 */
function syncAllDataSecure() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    // Process in batches to avoid overwhelming the server
    for (let i = 1; i < values.length; i += batchSize) {
      const batch = values.slice(i, Math.min(i + batchSize, values.length));
      
      for (const rowData of batch) {
        const payload = {
          apartment_id: String(rowData[0] || '').trim(),
          agency: String(rowData[1] || '').trim(),
          agency_short: String(rowData[2] || '').trim(),
          area: parseFloat(rowData[3]) || 0,
          price: parseFloat(rowData[4]) || 0,
          status: String(rowData[5] || '').trim()
        };
        
        // Skip invalid rows
        if (!payload.apartment_id || !payload.agency) continue;
        
        console.log(`Syncing apartment ${payload.apartment_id}...`);
        
        try {
          sendSecureWebhook(payload);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync ${payload.apartment_id}:`, error.toString());
          errorCount++;
        }
        
        // Small delay between requests
        Utilities.sleep(200);
      }
      
      // Longer delay between batches
      if (i + batchSize < values.length) {
        console.log(`Completed batch, waiting before next batch...`);
        Utilities.sleep(2000);
      }
    }
    
    console.log(`✅ Sync completed! Success: ${successCount}, Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Error in syncAllDataSecure:', error.toString());
    logError(SpreadsheetApp.getActiveSpreadsheet(), error, 'syncAllDataSecure');
  }
}

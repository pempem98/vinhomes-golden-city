/**
 * Google Apps Script for Real-time Apartment Ranking Dashboard
 * This script triggers when any cell in the spreadsheet is edited
 * and sends the updated row data to the backend webhook
 */

// Replace this with your actual backend URL
const WEBHOOK_URL = 'https://your-backend-url.com/api/update-sheet';
// For local development, you might use something like:
// const WEBHOOK_URL = 'http://localhost:5000/api/update-sheet';

/**
 * Trigger function that runs when any cell is edited
 * @param {Object} e - The edit event object
 */
function onEdit(e) {
  try {
    // Get the active sheet and range
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    
    // Only process edits on the main data sheet
    // You can modify this condition based on your sheet name
    if (sheet.getName() !== 'Sheet1') {
      console.log('Edit not on main sheet, ignoring...');
      return;
    }
    
    // Get the row number that was edited
    const editedRow = range.getRow();
    
    // Skip header row (assuming row 1 is header)
    if (editedRow <= 1) {
      console.log('Header row edited, ignoring...');
      return;
    }
    
    // Get all values from the edited row
    const rowData = sheet.getRange(editedRow, 1, 1, 5).getValues()[0];
    
    // Map the row data to the expected JSON structure
    // Columns mapping: Column A=apartment_id, B=agency, C=area, D=price, E=status
    const payload = {
      apartment_id: rowData[0] || '',
      agency: rowData[1] || '',
      area: parseFloat(rowData[2]) || 0,
      price: parseFloat(rowData[3]) || 0,
      status: rowData[4] || ''
    };
    
    // Validate that we have at least the apartment ID
    if (!payload.apartment_id) {
      console.log('No apartment ID found, skipping update...');
      return;
    }
    
    console.log('Sending update for apartment:', payload.apartment_id);
    console.log('Payload:', JSON.stringify(payload));
    
    // Send the data to the backend webhook
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true // Don't throw errors on HTTP error codes
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      console.log('Successfully sent data to backend');
      console.log('Response:', responseText);
    } else {
      console.error('Error response from backend:', responseCode, responseText);
    }
    
  } catch (error) {
    console.error('Error in onEdit trigger:', error.toString());
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Function to manually test the webhook (for debugging)
 * Run this function manually to test if your webhook is working
 */
function testWebhook() {
  const testPayload = {
    apartment_id: 'TEST01',
    agency: 'Test Agency',
    area: 85.5,
    price: 6.2,
    status: 'Đang Lock'
  };
  
  try {
    console.log('Testing webhook with payload:', JSON.stringify(testPayload));
    
    const response = UrlFetchApp.fetch(WEBHOOK_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(testPayload),
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('Response code:', responseCode);
    console.log('Response text:', responseText);
    
    if (responseCode >= 200 && responseCode < 300) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed');
    }
    
  } catch (error) {
    console.error('Error testing webhook:', error.toString());
  }
}

/**
 * Function to send all existing data to the backend (for initial sync)
 * Run this function after setting up your sheet to sync all existing data
 */
function syncAllData() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Skip header row
    for (let i = 1; i < values.length; i++) {
      const rowData = values[i];
      
      const payload = {
        apartment_id: rowData[0] || '',
        agency: rowData[1] || '',
        area: parseFloat(rowData[2]) || 0,
        price: parseFloat(rowData[3]) || 0,
        status: rowData[4] || ''
      };
      
      // Skip empty rows
      if (!payload.apartment_id) continue;
      
      console.log(`Syncing apartment ${payload.apartment_id}...`);
      
      const response = UrlFetchApp.fetch(WEBHOOK_URL, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
        console.log(`✅ Synced ${payload.MaCan}`);
      } else {
        console.log(`❌ Failed to sync ${payload.MaCan}: ${response.getContentText()}`);
      }
      
      // Add a small delay to avoid overwhelming the server
      Utilities.sleep(100);
    }
    
    console.log('✅ All data sync completed!');
    
  } catch (error) {
    console.error('Error syncing all data:', error.toString());
  }
}

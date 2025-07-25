# Real Estate Dashboard

Một ứng dụng dashboard thời gian thực để quản lý thông tin bất động sản với khả năng cập nhật trực tiếp và giao diện hiện đại.

## ✨ Tính năng

- 📊 **Dashboard thời gian thực**: Hiển thị dữ liệu bất động sản được cập nhật ngay lập tức
- 🔄 **Cập nhật trực tiếp**: Google Apps Script onEdit trigger gửi dữ liệu đến backend webhook
- 💾 **SQLite Database**: Cache dữ liệu local để truy cập nhanh và lưu trữ bền vững
- 🎨 **Giao diện hiện đại**: Theme xanh royal tối với phân màu theo trạng thái
- 🔝 **Tự động sắp xếp**: Căn hộ được cập nhật tự động di chuyển lên đầu bảng
- 📱 **Responsive Design**: Hoạt động tốt trên desktop và mobile

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express, Socket.IO, SQLite3
- **Frontend**: React.js, Socket.IO Client
- **Database**: SQLite
- **Sync**: Google Apps Script, UrlFetchApp
- **Version Control**: Git với .gitignore và .gitattributes

## Project Structure

```
/real-estate-app/
├── /backend/
│   ├── src/
│   │   └── server.js           # Main server file
│   ├── database.sqlite         # SQLite database file (auto-created)
│   └── package.json
├── /frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── background.jpg      # Background image
│   ├── src/
│   │   ├── components/
│   │   │   └── ApartmentTable.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
└── /google-apps-script/
    └── onEditTrigger.gs
```

## Getting Started

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm run dev  # For development with nodemon
# or
npm start    # For production
```

The server will start on port 5000 (or the port specified in the PORT environment variable).

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will start on port 3000 and automatically open in your browser.

### 3. Google Apps Script Setup

1. Open your Google Sheet
2. Go to `Extensions > Apps Script`
3. Replace the default code with the content from `google-apps-script/onEditTrigger.gs`
4. Update the `WEBHOOK_URL` variable with your backend URL:
   - For local development: `http://localhost:5000/api/update-sheet`
   - For production: `https://your-domain.com/api/update-sheet`
5. Save the script and set up the onEdit trigger:
   - Click on the clock icon (Triggers)
   - Click "+ Add Trigger"
   - Choose function: `onEdit`
   - Event source: `From spreadsheet`
   - Event type: `On edit`
   - Save

### 4. Google Sheet Format

Your Google Sheet should have the following columns:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| ApartmentID | Agency | Area | Price | Status |
| A01      | Agency 1 | 85.5     | 6.2      | Đang Lock |
| A02      | Agency 2 | 90.0     | 7.5      | Đã bán    |

## Environment Variables

### Backend

- `PORT`: Server port (default: 5000)

### Frontend

- `REACT_APP_BACKEND_URL`: Backend URL (default: http://localhost:5000)

## API Endpoints

### POST /api/update-sheet

Webhook endpoint for receiving updates from Google Apps Script.

**Request Body:**
```json
{
  "apartment_id": "A01",
  "agency": "Agency Name",
  "area": 85.5,
  "price": 6.2,
  "status": "Đang Lock"
}
```

### GET /api/health

Health check endpoint.

## Socket.IO Events

### Client → Server

- `connection`: Client connects to server

### Server → Client

- `apartment-update`: Sends updated apartment list to clients

## Styling

### Status Colors

- **Đã bán**: Red background (#a84343)
- **Đang Lock**: Yellow background (#f7b731)
- **Default**: Transparent background

### Theme

- **Primary Color**: Dark Royal Green (#023020)
- **Background**: Beautiful background image with gradient overlay for depth and readability
- **Text**: White text with shadows for readability
- **Image**: Custom background.jpg with semi-transparent green gradient overlay

## Deployment

### Backend Deployment (Example with Heroku)

1. Create a Heroku app
2. Set environment variables
3. Deploy the backend code
4. Update the Google Apps Script webhook URL

### Frontend Deployment (Example with Netlify)

1. Build the React app: `npm run build`
2. Deploy the `build` folder to Netlify
3. Set the `REACT_APP_BACKEND_URL` environment variable

## Development Tips

1. **Testing the webhook**: Use the `testWebhook()` function in Google Apps Script
2. **Initial data sync**: Use the `syncAllData()` function to populate the database
3. **Database inspection**: The SQLite database file is created automatically in the backend directory
4. **Debugging**: Check browser console and server logs for detailed information
5. **Code standards**: Project follows modern JavaScript naming conventions with camelCase for variables/functions and UPPER_CASE for constants

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the backend CORS configuration includes your frontend URL
2. **Webhook not working**: Check the Google Apps Script logs and verify the webhook URL
3. **Socket.IO connection issues**: Verify the backend URL and port in the frontend configuration
4. **Database issues**: Check file permissions for the SQLite database file

### Google Apps Script Debugging

1. Use `console.log()` statements in your script
2. Check the execution logs in the Apps Script editor
3. Test the webhook manually using the `testWebhook()` function

## License

This project is licensed under the ISC License.

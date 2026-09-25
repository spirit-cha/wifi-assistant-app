# Wi-Fi Complaint Application

A professional Angular application for collecting Wi-Fi device complaints from customers with automatic email reporting every 2 days.

## Features

✅ **Customer Information Collection**
- First and Last Name
- Primary & Secondary Phone Numbers
- Contract Number
- Landline Phone Number
- Video of Wi-Fi device in operation

✅ **Geolocation**
- Automatically detects customer location
- Displays address information
- Records GPS coordinates

✅ **Video Upload**
- Video file validation
- Preview before submission
- Secure file storage

✅ **Email Reporting**
- Automatic batch email every 2 days
- Immediate acknowledgment emails
- Detailed complaint reports
- Configurable recipient email

✅ **Form Validation**
- Real-time validation
- Phone number format validation
- Required field validation
- User-friendly error messages

✅ **Responsive Design**
- Mobile-friendly interface
- Works on all devices
- Beautiful gradient UI

## Project Structure

```
WIFI APPLICATION/
├── wifi-complaint-app/           # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── complaint-form/      # Main form component
│   │   │   │   └── complaint-success/   # Success page
│   │   │   ├── services/
│   │   │   │   └── complaint.ts         # API service
│   │   │   ├── app.routes.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.ts
│   │   └── main.ts
│   └── package.json
├── server.js                     # Express backend server
├── server-package.json           # Backend dependencies
└── README.md                     # This file
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 21+
- Gmail account with App Password (for email functionality)

### Frontend Setup

```bash
cd "C:\Users\hmercha\WIFI APPLICATION\wifi-complaint-app"
npm install
```

### Backend Setup

```bash
cd "C:\Users\hmercha\WIFI APPLICATION"
npm install -f --prefix . --save-exact express@4.18.2 cors@2.8.5 multer@1.4.5-lts.1 nodemailer@6.9.7
```

Or install from server-package.json:
```bash
# Copy server-package.json to package.json in root directory
npm install
```

## Configuration

### Email Setup

The application uses Gmail to send emails. To enable email functionality:

1. **Get Gmail App Password:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Create App Password for "Mail"
   - Copy the 16-character password

2. **Set Environment Variables:**
   
   On Windows (Command Prompt):
   ```cmd
   set EMAIL_USER=med94555112@gmail.com
   set EMAIL_PASSWORD=your-16-char-app-password
   ```

   On Windows (PowerShell):
   ```powershell
   $env:EMAIL_USER="med94555112@gmail.com"
   $env:EMAIL_PASSWORD="your-16-char-app-password"
   ```

   On Mac/Linux:
   ```bash
   export EMAIL_USER="med94555112@gmail.com"
   export EMAIL_PASSWORD="your-16-char-app-password"
   ```

### Backend URL Configuration

The frontend expects the backend to be available at `http://localhost:3000` by default.

If running on a different URL, update the `apiUrl` in `src/app/services/complaint.ts`:

```typescript
private apiUrl = 'http://your-backend-url:port/api/complaints';
```

## Running the Application

### Start Backend Server

```bash
cd "C:\Users\hmercha\WIFI APPLICATION"
npm start
```

The server will start on `http://localhost:3000`

### Start Angular Frontend

In a new terminal:

```bash
cd "C:\Users\hmercha\WIFI APPLICATION\wifi-complaint-app"
ng serve
```

The application will be available at `http://localhost:4200`

## How It Works

### Customer Workflow

1. **User Access**: Customer opens the application
2. **Location Detection**: App automatically detects customer's location
3. **Form Submission**: Customer fills in their information and uploads a video
4. **Validation**: Real-time validation ensures all required fields are filled
5. **Success**: Customer sees confirmation message

### Complaint Processing

1. **Immediate Acknowledgment**: Backend sends acknowledgment email to your inbox
2. **Queue Storage**: Complaint is stored in the queue
3. **Periodic Sending**: Every 2 days, all queued complaints are compiled and sent to `med94555112@gmail.com`
4. **Email Report**: Includes all complaint details, location info, and video file names

### Email Schedule

- **Immediate Email**: When complaint is submitted
- **Batch Email**: Every 2 days at server startup + 2-day intervals

To manually trigger email sending:
```bash
curl -X POST http://localhost:3000/api/complaints/send-email \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"med94555112@gmail.com"}'
```

## API Endpoints

### Submit Complaint
```
POST /api/complaints/submit
Content-Type: multipart/form-data

Required Fields:
- firstName: string
- lastName: string
- primaryPhone: string (formatted phone number)
- contractNumber: string
- landlinePhone: string (formatted phone number)
- videoFile: File (video file)
- latitude: number
- longitude: number
- address: string
- timestamp: ISO 8601 string
- secondaryPhone: string (optional)

Response:
{
  "success": true,
  "message": "Complaint submitted successfully",
  "complaintId": number
}
```

### Send Queued Complaints
```
POST /api/complaints/send-email
Content-Type: application/json

Body:
{
  "recipientEmail": "med94555112@gmail.com"
}

Response:
{
  "success": true,
  "message": "Complaints sent to med94555112@gmail.com"
}
```

### Get Queue Count
```
GET /api/complaints/queue-count

Response:
{
  "count": number,
  "complaints": [complaint objects]
}
```

## Form Fields Explained

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| First Name | Text | ✅ | Any | John |
| Last Name | Text | ✅ | Any | Doe |
| Primary Phone | Tel | ✅ | +1 (123) 456-7890 | +1 (555) 123-4567 |
| Secondary Phone | Tel | ❌ | +1 (123) 456-7890 | +1 (555) 987-6543 |
| Contract Number | Text | ✅ | Any | CONTRACT-12345 |
| Landline Phone | Tel | ✅ | +1 (123) 456-7890 | +1 (555) 222-3333 |
| Wi-Fi Video | File | ✅ | MP4, WebM, etc. | device-status.mp4 |

## Location Features

- **Automatic Detection**: Uses browser Geolocation API
- **Reverse Geocoding**: Converts coordinates to address using OpenStreetMap
- **Privacy**: User must grant permission for location access
- **Fallback**: If location unavailable, shows "Address not available"

## Troubleshooting

### Email Not Sending
- ✅ Check EMAIL_USER and EMAIL_PASSWORD environment variables are set
- ✅ Verify Gmail App Password is correct (16 characters, no spaces)
- ✅ Check Gmail account 2FA is enabled
- ✅ Verify internet connection

### Location Not Detected
- ✅ Allow location access when browser asks
- ✅ Browser must have HTTPS or localhost
- ✅ Check if location services are enabled on device

### Video Upload Issues
- ✅ Ensure file is a valid video format
- ✅ Check file size isn't too large
- ✅ Verify disk space on server for uploads folder

### Backend Connection Issues
- ✅ Verify backend server is running on port 3000
- ✅ Check CORS is properly configured
- ✅ Ensure frontend URL matches backend CORS settings

## Production Deployment

### Backend Deployment

1. **Environment Setup**
   ```
   EMAIL_USER=med94555112@gmail.com
   EMAIL_PASSWORD=your-app-password
   PORT=3000
   NODE_ENV=production
   ```

2. **Deploy with PM2** (Recommended)
   ```bash
   npm install -g pm2
   pm2 start server.js --name "wifi-complaint-server"
   pm2 startup
   pm2 save
   ```

3. **Use HTTPS** (Recommended for location services)
   - Update frontend API URL to use HTTPS

### Frontend Deployment

1. **Build Production Bundle**
   ```bash
   ng build --configuration production
   ```

2. **Output in `dist/wifi-complaint-app/browser` folder**

3. **Deploy to Web Server** (Nginx, Apache, etc.)

## Database Integration

To persist complaints to a database instead of memory:

Replace the in-memory queue in `server.js` with database calls:

```javascript
// Example: MongoDB
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  primaryPhone: String,
  // ... other fields
  createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// In POST endpoint:
await Complaint.create(complaint);

// In periodic send:
const complaints = await Complaint.find({ sent: false });
// ... send email ...
await Complaint.updateMany({ sent: false }, { sent: true });
```

## Security Considerations

⚠️ **Important:**
- Never commit `EMAIL_PASSWORD` to version control
- Use environment variables for all sensitive data
- Implement rate limiting in production
- Validate all user inputs on backend
- Store videos securely with access controls
- Use HTTPS in production
- Implement authentication if needed

## License

ISC

## Support

For issues or questions about the application, please contact the development team.

---

**Last Updated**: 2026-01-14
**Angular Version**: 21.x
**Node.js Version**: 18+

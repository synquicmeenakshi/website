# ZenYourLife Backend - Appointment Booking System

A RESTful API built with Express.js and MongoDB for managing massage/wellness service appointments.

## Features

- **Service Management**: Fetch massage and wellness services from database
- **Appointment Booking**: Create and manage customer appointments
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **RESTful API**: Clean and organized API endpoints
- **Data Validation**: Input validation and error handling
- **CORS Enabled**: Ready for frontend integration

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

## Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher) installed
- **MongoDB** installed and running locally, OR
- **MongoDB Atlas** account for cloud database

## Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory (already provided):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zenyourlife
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
Replace `MONGODB_URI` with your connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zenyourlife?retryWrites=true&w=majority
```

### 3. Start MongoDB (Local Installation)

If using local MongoDB:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 4. Seed the Database

Populate the database with massage services:

```bash
npm run seed
```

This will create 8 service entries:
- Relaxing massage
- Signature hot stone
- Permanent Make-Up (PMU)
- Healing reflexology
- Facial Care
- Sports Massage
- Back and Neck
- Hot Stone Therapy

### 5. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Services

#### Get All Services
```http
GET /api/services
```
Response:
```json
{
  "success": true,
  "count": 8,
  "data": [
    {
      "_id": "...",
      "title": "Relaxing massage",
      "description": "A gentle, soothing massage...",
      "category": "massage",
      "duration": 60,
      "price": 65,
      "isActive": true
    }
  ]
}
```

#### Get Single Service
```http
GET /api/services/:id
```

#### Create Service (Admin)
```http
POST /api/services
Content-Type: application/json

{
  "title": "New Massage",
  "description": "Description here",
  "category": "massage",
  "duration": 60,
  "price": 70
}
```

### Appointments

#### Create Appointment
```http
POST /api/appointments
Content-Type: application/json

{
  "serviceId": "service_id_here",
  "serviceTitle": "Relaxing massage",
  "selectedDate": "2025-12-01T00:00:00.000Z",
  "selectedTime": "2:30",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+32455689",
  "country": "BE",
  "gender": "male",
  "specialRequests": "Please use lavender oil",
  "message": "Looking forward to the session"
}
```

#### Get All Appointments
```http
GET /api/appointments

# With filters
GET /api/appointments?status=confirmed
GET /api/appointments?email=john@example.com
GET /api/appointments?date=2025-12-01
```

#### Get Single Appointment
```http
GET /api/appointments/:id
```

#### Update Appointment Status
```http
PATCH /api/appointments/:id/status
Content-Type: application/json

{
  "status": "confirmed"  // pending, confirmed, cancelled, completed
}
```

#### Cancel Appointment
```http
PATCH /api/appointments/:id/cancel
```

#### Delete Appointment (Admin)
```http
DELETE /api/appointments/:id
```

## Database Schema

### Service Model
```javascript
{
  title: String (required),
  description: String (required),
  category: String (enum: massage, facial, pmu, therapy),
  duration: Number (minutes),
  price: Number,
  isActive: Boolean,
  timestamps: true
}
```

### Appointment Model
```javascript
{
  service: ObjectId (ref: Service),
  serviceTitle: String,
  appointmentDate: Date,
  appointmentTime: String,
  firstName: String (required),
  lastName: String (required),
  email: String (required),
  phoneNumber: String (required),
  country: String,
  gender: String (enum: male, female, other),
  specialRequests: String,
  message: String,
  status: String (enum: pending, confirmed, cancelled, completed),
  timestamps: true
}
```

## Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── serviceController.js
│   └── appointmentController.js
├── models/              # Database schemas
│   ├── Service.js
│   └── Appointment.js
├── routes/              # API routes
│   ├── serviceRoutes.js
│   └── appointmentRoutes.js
├── .env                 # Environment variables
├── server.js            # Express server setup
├── seed.js              # Database seeding script
├── package.json         # Dependencies
└── README.md           # Documentation
```

## Testing the API

### Using cURL

**Get all services:**
```bash
curl http://localhost:5000/api/services
```

**Create appointment:**
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "YOUR_SERVICE_ID",
    "serviceTitle": "Relaxing massage",
    "selectedDate": "2025-12-01T00:00:00.000Z",
    "selectedTime": "2:30",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "+32455689",
    "country": "BE",
    "gender": "male"
  }'
```

### Using Postman or Thunder Client

1. Import the base URL: `http://localhost:5000`
2. Test each endpoint with appropriate HTTP methods
3. Add `Content-Type: application/json` header for POST/PATCH requests

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check your MongoDB URI in `.env`
- Ensure MongoDB service is running
- Verify username/password for Atlas

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

Or change the PORT in `.env` to a different number.

### Services Not Loading

**Solution:**
1. Run the seed script: `npm run seed`
2. Check MongoDB connection
3. Verify API endpoint: `http://localhost:5000/api/services`

## Frontend Integration

The frontend React application should:

1. **Fetch services** from `GET /api/services` on component mount
2. **Submit appointments** to `POST /api/appointments` with all required fields
3. **Handle responses** and show success/error messages

Example frontend code provided in:
- `frontend/src/components/Booking.tsx` - Service selection
- `frontend/src/components/BookingDate.tsx` - Date/time selection
- `frontend/src/components/BookingForm.tsx` - Form submission

## Future Enhancements

- [ ] Add authentication & authorization
- [ ] Email notifications for appointments
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Calendar availability system
- [ ] SMS reminders
- [ ] User accounts & booking history

## License

ISC

## Support

For issues or questions, please create an issue in the repository.

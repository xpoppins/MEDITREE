# MEDITREE - MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new project (e.g., "meditree")

## Step 2: Create a Free Cluster

1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Select your preferred cloud provider and region
4. Click "Create Cluster" (takes 1-3 minutes)

## Step 3: Create Database User

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Whitelist Your IP

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add your specific IP)
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/familyhealth
   ```

## Step 6: Configure Environment Variables

1. Copy `server/.env.example` to `server/.env`
2. Fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/familyhealth
JWT_SECRET=your-super-secret-random-string-here
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Step 7: Install Dependencies & Run

```bash
cd server
npm install
npm run dev
```

## Step 8: Update Frontend API URL

In `client/.env` or your frontend config, set:
```
VITE_API_URL=http://localhost:5000/api
```

## Google Sign-In Setup (Optional)

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
4. Configure consent screen (External)
5. Add authorized JavaScript origins: `http://localhost:5173`
6. Copy the Client ID to your `.env` file

## Project Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/           # Business logic
│   ├── authController.js  # Login, Register, Google Sign-In
│   ├── familyController.js # Family & Member management
│   ├── readingController.js # BP, Sugar, Weight readings
│   ├── medicineController.js # Medicine management
│   └── appointmentController.js # Appointments
├── middleware/
│   ├── auth.js            # JWT verification
│   └── errorHandler.js    # Error handling
├── models/                # MongoDB schemas
│   ├── User.js            # User accounts
│   ├── Family.js          # Family groups
│   ├── Member.js          # Family members
│   ├── Reading.js         # Health readings
│   ├── Medicine.js        # Medicines
│   ├── Appointment.js     # Doctor appointments
│   └── Alert.js           # Health alerts
├── routes/                # API endpoints
│   ├── authRoutes.js
│   ├── familyRoutes.js
│   ├── readingRoutes.js
│   ├── medicineRoutes.js
│   └── appointmentRoutes.js
├── utils/
│   ├── access.js          # Permission checks
│   └── healthRules.js     # BP/Sugar/BMI logic
├── server.js              # Express app entry
└── .env.example           # Environment template
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register-manager | Create family + manager |
| POST | /api/auth/join | Join family with invite code |
| POST | /api/auth/login | Email/password login |
| POST | /api/auth/google-login | Google Sign-In |
| GET | /api/auth/me | Current user info |
| GET | /api/family | Get family details |
| POST | /api/family/regenerate-code | New invite code |
| GET | /api/family/members | List all members |
| POST | /api/family/members | Add member |
| PUT | /api/family/members/:id | Update member |
| DELETE | /api/family/members/:id | Remove member |
| POST | /api/readings | Add reading |
| GET | /api/readings?memberId=&type=&days= | Get readings |
| PUT | /api/readings/:id | Update reading |
| DELETE | /api/readings/:id | Delete reading |
| GET | /api/medicines | List medicines |
| POST | /api/medicines | Add medicine |
| PATCH | /api/medicines/:id/toggle | Toggle taken |
| GET | /api/appointments | List appointments |
| POST | /api/appointments | Add appointment |
| DELETE | /api/appointments/:id | Delete appointment |

## Free Tier Limits (M0)

- 512 MB storage
- Shared RAM
- No dedicated resources
- Perfect for development and small production apps
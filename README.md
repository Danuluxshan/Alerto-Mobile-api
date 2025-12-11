# Alerto API - Backend Server

Express.js backend with MongoDB for the Alerto application.

## 📁 Project Structure

```
Alerto-api/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User CRUD operations
│   ├── cameraController.js   # Camera CRUD operations
│   ├── threatController.js   # Threat CRUD operations
│   └── taskController.js    # Task CRUD operations
├── models/
│   ├── User.js              # User model
│   ├── Camera.js            # Camera model
│   ├── Threat.js            # Threat model
│   ├── Task.js              # Task model
│   └── EmployeeActive.js    # EmployeeActive model
├── routes/
│   ├── auth.js              # Auth routes
│   ├── users.js             # User routes
│   ├── cameras.js           # Camera routes
│   ├── threats.js           # Threat routes
│   └── tasks.js             # Task routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── .env.example             # Environment variables template
├── server.js                # Main server file
└── package.json             # Dependencies

```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd "E:\Camera project app\Alerto-api"
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:

```env
MONGO_URI=mongodb://localhost:27017/alerto_db
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alerto_db?retryWrites=true&w=majority
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud) - no local installation needed**

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/:id` - Get user by ID (requires auth)
- `GET /api/users/active` - Get active employees (requires auth)
- `POST /api/users` - Create user (requires auth)
- `PUT /api/users/:id` - Update user (requires auth)
- `DELETE /api/users/:id` - Delete user (requires auth)

### Cameras
- `GET /api/cameras` - Get all cameras (requires auth)
- `GET /api/cameras/:id` - Get camera by ID (requires auth)
- `POST /api/cameras` - Create camera (requires auth)
- `PUT /api/cameras/:id` - Update camera (requires auth)
- `DELETE /api/cameras/:id` - Delete camera (requires auth)

### Threats
- `GET /api/threats` - Get all threats (requires auth)
  - Query params: `?threat_status=true&threat_level=High`
- `GET /api/threats/:id` - Get threat by ID (requires auth)
- `POST /api/threats` - Create threat (requires auth)
- `PUT /api/threats/:id` - Update threat (requires auth)
- `DELETE /api/threats/:id` - Delete threat (requires auth)

### Tasks
- `GET /api/tasks` - Get all tasks (requires auth)
  - Query params: `?user_id=xxx&threat_id=xxx&review_status=true`
- `GET /api/tasks/user/:userId` - Get tasks by user ID (requires auth)
- `GET /api/tasks/:id` - Get task by ID (requires auth)
- `POST /api/tasks` - Create task (assign threat) (requires auth)
- `PUT /api/tasks/:id` - Update task (submit report) (requires auth)
- `DELETE /api/tasks/:id` - Delete task (requires auth)

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <your-token>
```

## 📝 Example API Calls

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "danu@gmail.com",
  "password": "Pass@123"
}
```

### Get All Users (with auth token)
```bash
GET http://localhost:5000/api/users
Authorization: Bearer <your-token>
```

## 🛠️ Troubleshooting

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify MONGO_URI in `.env` file
   - For local MongoDB: `mongodb://localhost:27017/alerto_db`

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Or kill the process using port 5000

3. **JWT Secret Error**
   - Make sure JWT_SECRET is set in `.env` file

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemon** - Development auto-reload


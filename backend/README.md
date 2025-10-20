# Plan Viaje Backend API

Backend REST API for Plan Viaje application built with Node.js, Express, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your database credentials and API keys

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js
│   │   ├── environment.js
│   │   ├── firebase.js
│   │   └── constants.js
│   ├── models/          # Sequelize models
│   │   ├── Usuario.js
│   │   └── index.js
│   ├── routes/          # API routes
│   │   ├── auth.routes.js
│   │   └── index.js
│   ├── controllers/     # Route controllers
│   │   └── authController.js
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   ├── cors.js
│   │   └── rateLimit.js
│   ├── utils/           # Utilities
│   │   ├── logger.js
│   │   ├── jwt.js
│   │   ├── bcrypt.js
│   │   ├── validators.js
│   │   └── errors.js
│   └── app.js           # Express app setup
├── server.js            # Server entry point
├── .env                 # Environment variables
├── .env.example         # Environment template
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with Firebase token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Health Check
- `GET /api/health` - API health status
- `GET /` - API information

## 🗄️ Database

The application uses PostgreSQL with Sequelize ORM.

### Connection
Database connection is configured in `src/config/database.js` using environment variables.

### Models
Models are defined in `src/models/` and use Sequelize.

## 🔐 Authentication

Authentication uses Firebase Admin SDK combined with JWT tokens:

1. Client authenticates with Firebase
2. Client sends Firebase ID token to backend
3. Backend verifies token and issues JWT
4. JWT is used for subsequent API requests

## 🛡️ Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT token authentication
- Password hashing with bcrypt
- Input validation with Joi
- Error handling

## 📝 Environment Variables

See `.env.example` for required environment variables:
- Database configuration
- JWT secrets
- Firebase credentials
- Third-party API keys (Mercado Pago, Cloudinary, etc.)

## 🧪 Testing

```bash
npm test
```

## 📊 Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🚀 Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database
3. Set secure JWT secret
4. Configure CORS for production domain
5. Set up process manager (PM2)

## 📚 Documentation

API documentation will be available at `/api/docs` (to be implemented with Swagger).

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

MIT

# ⚙️ QIIC Backend Server

## 📖 Overview

Node.js + Express server with Socket.IO for real-time communication and Azure Cosmos DB integration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Azure Cosmos DB account (optional)
- MSSQL Server (optional)

### Installation

```bash
# Install dependencies
npm install

# Start development server
node src/server.js

# Start with nodemon (auto-reload)
npm run dev
```

---

## 📁 Structure

```
src/
├── config/           # Configuration files
│   ├── database.js   # Database config
│   ├── cosmos.js     # Cosmos DB config
│   └── env.js        # Environment config
├── models/           # Data models
├── routes/           # API routes
├── controllers/      # Route controllers
├── middleware/       # Express middleware
├── services/         # Business logic
├── events/           # Socket.IO events
├── utils/            # Utility functions
└── data/             # Static data
```

---

## 🎯 Key Features

- ✅ Express.js REST API
- ✅ Socket.IO real-time communication
- ✅ Azure Cosmos DB integration
- ✅ MSSQL support
- ✅ CORS enabled
- ✅ User tracking
- ✅ Admin real-time dashboard

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
PORT=4000
NODE_ENV=development

# Cosmos DB (optional)
COSMOS_ENDPOINT=your_endpoint
COSMOS_KEY=your_key
COSMOS_DATABASE=QIIC
COSMOS_CONTAINER=policies

# MSSQL (optional)
DB_SERVER=localhost
DB_DATABASE=QIIC
DB_USER=sa
DB_PASSWORD=your_password
```

---

## 📡 API Endpoints

### Car Data
- `GET /api/car-makes` - Get all car makes
- `GET /api/car-models/:make` - Get models for a make

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Policies
- `GET /api/policies` - Get all policies
- `POST /api/policies` - Create policy
- `GET /api/policies/:id` - Get policy by ID

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle

### Claims
- `GET /api/claims` - Get all claims
- `POST /api/claims` - Create claim

---

## 🔌 Socket.IO Events

### Client → Server
- `userConnected` - User connects with IP
- `userNavigated` - User navigates to page
- `submitCarDetails` - Submit car details
- `submitMoreDetails` - Submit additional details
- `submitInsuranceSelection` - Submit insurance choice

### Server → Client
- `ackCarDetails` - Acknowledge car details
- `ackMoreDetails` - Acknowledge more details
- `newSubmission` - New user submission (admin)
- `userUpdate` - User activity update (admin)

---

## 🗄️ Database

### Cosmos DB Collections
- `customers` - Customer data
- `policies` - Insurance policies
- `vehicles` - Vehicle information
- `claims` - Insurance claims

### MSSQL Tables
- See `/database/setup-mssql-db.sql`

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `node src/server.js` | Start server |
| `npm run dev` | Start with nodemon |
| `npm test` | Run tests |

---

## 🔒 Security

- CORS configured for specific origins
- Environment variables for sensitive data
- Input validation on all endpoints
- SQL injection prevention
- XSS protection

---

## 📊 Logging

Logs are stored in `/logs/`:
- `error.log` - Error logs only
- `combined.log` - All logs

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Production Build

```bash
# Set environment
export NODE_ENV=production

# Start server
node src/server.js
```

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start src/server.js --name qiic-backend

# Save configuration
pm2 save
pm2 startup
```

---

## 📝 Code Style

- Use async/await for async operations
- Handle all errors properly
- Use try-catch blocks
- Log important events
- Keep functions small and focused

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

Proprietary - QIIC Insurance

---

**Version**: 2.0  
**Last Updated**: November 21, 2025  
**Maintainer**: QIIC Development Team

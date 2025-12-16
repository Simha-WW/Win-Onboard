# WinOnboard Backend API

Backend server for the WinOnboard HR Portal - A comprehensive onboarding and HR management system.

## 🚀 Features

### HR Management
- **Add User/Fresher**: Complete onboarding workflow with secure password generation
- **Email Notifications**: Automated welcome emails with credentials
- **User Management**: CRUD operations for fresher accounts
- **Security**: bcrypt password hashing, JWT authentication ready

### Technical Features
- **TypeScript**: Full type safety and modern development experience
- **Express.js**: RESTful API with middleware support
- **Dual Database**: MySQL for HR features, MSSQL for legacy support
- **Email Service**: nodemailer integration for automated communications
- **Security**: Helmet, CORS, compression, input validation

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/        # HTTP request handlers
│   │   └── hr.controller.ts
│   ├── services/           # Business logic layer
│   │   ├── email.service.ts
│   │   └── fresher.service.ts
│   ├── utils/              # Utility functions
│   │   └── password.util.ts
│   ├── routes/             # API route definitions
│   │   ├── hr.routes.ts
│   │   └── index.ts
│   ├── config/             # Configuration files
│   │   └── database.ts
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Server entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables
└── .env.example            # Environment template
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm 8+
- MySQL 8.0+ (for HR features)
- MSSQL Server (for existing features)

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# MySQL Database (for HR features)
DB_HOST=localhost
DB_PORT=3306
DB_NAME_MYSQL=winonboard
DB_USER_MYSQL=root
DB_PASSWORD_MYSQL=your_password

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@company.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM_NAME=WinOnboard HR Team
EMAIL_FROM_ADDRESS=hr@company.com

# Security
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
BCRYPT_SALT_ROUNDS=12

# Company Information
COMPANY_NAME=Your Company Name
COMPANY_WEBSITE=https://yourcompany.com
HR_CONTACT_EMAIL=hr@yourcompany.com
```

### 3. Database Setup

#### MySQL Database (for HR features)

Create the database and tables:

```sql
-- Create database
CREATE DATABASE winonboard;
USE winonboard;

-- Create freshers table
CREATE TABLE freshers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    start_date DATE,
    manager_email VARCHAR(255),
    status ENUM('pending', 'active', 'inactive') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_status (status)
);
```

#### MSSQL Database (existing)

The existing MSSQL configuration is preserved for legacy features.

### 4. Email Configuration

For Gmail SMTP (recommended for development):

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to Google Account Settings > Security > App passwords
   - Generate a password for "Mail"
   - Use this password in EMAIL_PASSWORD

For production, use your company's SMTP server or services like:
- SendGrid
- Amazon SES
- Microsoft Exchange

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:3001` with hot reload.

### Production Build
```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run production server
- `npm run lint` - Check code style and errors
- `npm run test` - Run test suite
- `npm run type-check` - Check TypeScript without building

## 📚 API Endpoints

### Health Check
- `GET /` - Server status
- `GET /api/health` - API health check

### HR Management
- `POST /api/hr/freshers` - Create new fresher account
- `GET /api/hr/freshers` - Get all freshers (with pagination)
- `GET /api/hr/freshers/:id` - Get specific fresher
- `POST /api/hr/freshers/:id/resend-email` - Resend welcome email

### Sample API Usage

#### Create Fresher Account
```javascript
POST /api/hr/freshers
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1-555-0123",
  "department": "Engineering",
  "position": "Software Developer",
  "startDate": "2024-01-15",
  "managerEmail": "jane.manager@company.com"
}
```

#### Response
```javascript
{
  "success": true,
  "message": "Fresher account created successfully",
  "data": {
    "id": 123,
    "username": "john.doe",
    "email": "john.doe@company.com",
    "temporaryPassword": "TempPass123!",
    "welcomeEmailSent": true
  }
}
```

## 🔐 Security Features

### Password Security
- bcrypt hashing with configurable salt rounds
- Secure random password generation
- Password complexity requirements

### API Security
- Helmet.js for security headers
- CORS configuration
- Request rate limiting (planned)
- Input validation with Joi
- JWT authentication (ready to implement)

### Email Security
- SMTP authentication
- No plain-text password storage
- Secure credential management

## 🛠️ Development

### Adding New Features

1. **Controllers**: Handle HTTP requests in `src/controllers/`
2. **Services**: Business logic in `src/services/`
3. **Routes**: API endpoints in `src/routes/`
4. **Utils**: Helper functions in `src/utils/`

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Consistent error handling patterns
- Service layer architecture

### Database Operations
```typescript
// MySQL (for HR features)
import { executeMySQLQuery } from '@/config/database';

const freshers = await executeMySQLQuery<Fresher>(
  'SELECT * FROM freshers WHERE status = ?',
  ['active']
);

// MSSQL (for legacy features)
import { executeMSSQLQuery } from '@/config/database';

const results = await executeMSSQLQuery('SELECT * FROM legacy_table');
```

## 🚧 TODO / Roadmap

### High Priority
- [ ] Complete database integration (replace TODO comments)
- [ ] Add authentication middleware
- [ ] Implement role-based access control
- [ ] Add request validation middleware
- [ ] Create database migration scripts

### Medium Priority
- [ ] Add unit and integration tests
- [ ] Implement file upload for documents
- [ ] Add audit logging
- [ ] Create API documentation with Swagger
- [ ] Add rate limiting

### Low Priority
- [ ] Add real-time notifications
- [ ] Implement bulk operations
- [ ] Add data export features
- [ ] Create admin dashboard API
- [ ] Add monitoring and metrics

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 3001 | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 | No |
| `DB_HOST` | MySQL host | localhost | Yes |
| `DB_PORT` | MySQL port | 3306 | No |
| `DB_NAME_MYSQL` | MySQL database name | winonboard | Yes |
| `DB_USER_MYSQL` | MySQL username | root | Yes |
| `DB_PASSWORD_MYSQL` | MySQL password | - | Yes |
| `EMAIL_HOST` | SMTP server | smtp.gmail.com | Yes |
| `EMAIL_PORT` | SMTP port | 587 | No |
| `EMAIL_USER` | SMTP username | - | Yes |
| `EMAIL_PASSWORD` | SMTP password | - | Yes |
| `JWT_SECRET` | JWT signing key | - | Yes |
| `BCRYPT_SALT_ROUNDS` | bcrypt salt rounds | 12 | No |

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify database server is running
- Check connection credentials in `.env`
- Ensure database exists and user has permissions

**Email Sending Failed**
- Verify SMTP credentials
- Check firewall/network settings
- For Gmail, ensure App Password is used

**TypeScript Compilation Errors**
- Run `npm run type-check` for detailed errors
- Ensure all dependencies are installed
- Check TypeScript version compatibility

**Port Already in Use**
- Change PORT in `.env` file
- Kill existing process: `lsof -ti:3001 | xargs kill`

### Logs
Development logs are output to console. Production logs can be configured in the logging section of the code.

## 🤝 Contributing

1. Follow TypeScript and ESLint conventions
2. Write tests for new features
3. Update documentation for API changes
4. Follow the existing service layer pattern

## 📄 License

MIT License - see LICENSE file for details.
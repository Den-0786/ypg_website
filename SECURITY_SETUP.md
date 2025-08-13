# Security Setup Guide

## Environment Variables Required

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgres://username:password@host:port/database
DATABASE_URL_UNPOOLED=postgresql://username:password@host:port/database

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Important Security Notes

1. **NEVER commit `.env.local` to version control**
2. **Use strong, unique passwords for admin credentials**
3. **Change default credentials immediately after setup**
4. **Use environment-specific configurations for production**

## Setup Instructions

1. Copy the example above to `.env.local`
2. Update database URLs with your actual database connection strings
3. Run the admin credentials setup script: `node scripts/setup-admin-credentials.js`
4. Login with default credentials and change them immediately

## Security Features

### Admin Login Protection

- **Progressive Lockout System**: Prevents brute force attacks
- **Attempt Tracking**: Monitors failed login attempts by IP address
- **Escalating Timeouts**:
  - 3 failed attempts → 5 minutes lockout
  - 6 failed attempts → 10 minutes lockout
  - 9+ failed attempts → 24 hours lockout
- **Automatic Reset**: Successful login resets all attempts

### Credential Management

- **Database Storage**: Credentials stored securely in database
- **Password Hashing**: All passwords hashed with bcrypt
- **Dynamic Updates**: Change credentials without server restart
- **No Hardcoded Values**: No default credentials in code

## Production Deployment

For production deployment:

- Use environment variables in your hosting platform
- Never use default or weak passwords
- Enable HTTPS
- Use secure database connections
- Regularly rotate admin credentials
- Monitor login attempts and lockouts

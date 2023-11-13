# DOCUMENTATION FOR THE BACKEND

1. Backend API Endpoint:

   - Base URL: https://futa-fleet-guard.onrender.com
   - for authentication/authorization for the use of protected features (like update of vehicle info, removing of users, transfer of drivers, etc), I used JWT token, in form of bearer token.

2. Available API Endpoints:
   - /api/auth/signup => user should provide [ email, password, role, name, phone]
   - /api/auth/login => user should provide [ email, password]
   - /api/auth/password-recovery-code => user shuld provide [email, ]
   - /api/auth/recovery-code-verify => user should provide [recovery-code, ]
   - /api/auth/recover-password => user should provide [recovery-code, new-password]
3. Data Formats:

   - The API primarily returns data in JSON format. Ensure that your frontend can handle JSON responses.

4. API Data Result:
   1. For successful data fetch.
   - .userInfo
   2. For errors
   - .err

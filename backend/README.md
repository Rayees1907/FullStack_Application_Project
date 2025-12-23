# Simple Bank Backend

Small Express backend for the simple banking demo.

Endpoints:
- POST /api/auth/signup {name,email,password} -> {token,user}
- POST /api/auth/login {email,password} -> {token,user}
- GET /api/accounts -> [accounts] (requires Authorization: Bearer <token>)
- GET /api/accounts/:id -> { account, transactions }
- POST /api/transactions/deposit {account_id,amount} -> { balance }
- POST /api/transactions/withdraw {account_id,amount } -> { balance }

Quick start:
1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`
2. npm install
3. npm run migrate
4. npm run seed
5. npm run dev

Notes:
- For simplicity this demo uses JWT and bcrypt password storage. It's intentionally minimal for learning.

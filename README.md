# Crochus

Crochus is a full-stack handmade catalogue and ordering app built with Angular, Express, and PostgreSQL stored procedures.

## Stack

- Angular 17 storefront + admin panel
- Express API under `server/`
- PostgreSQL schema, seed data, and stored procedures under `database/init/`
- JWT auth for customers and admin
- OTP email flow with SMTP fallback to console logging
- Cloudinary uploads with local file fallback

## Local Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

Default local setup uses the workspace PostgreSQL helper on port `55432`:

```bash
npm run db:up
```

If you prefer Docker and have Docker installed:

```bash
npm run db:docker:up
```

### 3. Start the API

```bash
npm run start:server
```

API base URL:

```text
http://localhost:3000/api/v1
```

### 4. Start the Angular app

```bash
npm start
```

Frontend URL:

```text
http://localhost:4200
```

## Useful Commands

```bash
npm run build
npm run test:server
npm run db:reset
npm run db:down
npm run db:local:status
```

## Environment

The repo includes `.env.example` with safe local defaults.

Important local defaults:

- `PGHOST=127.0.0.1`
- `PGPORT=55432`
- `PGDATABASE=crochus`
- `PGUSER=postgres`
- `PGPASSWORD=` (blank because the local helper uses trust auth)

## API Highlights

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/login`
- `GET /api/v1/products`
- `GET /api/v1/categories`
- `GET /api/v1/cart`
- `POST /api/v1/orders`
- `POST /api/v1/contact`
- `POST /api/v1/admin/products` with `multipart/form-data`
- `PUT /api/v1/admin/settings/whatsapp`

## Media Uploads

- Product photos accept `photos` or `photos[]`
- Optional product video accepts `video`
- If Cloudinary env vars are missing, files are served from `server/uploads`

## Notes

- Orders are saved to PostgreSQL before WhatsApp is opened.
- OTP and contact email flows log to the console when SMTP is not configured.
- `npm run db:up` bootstraps a fresh local database for development.

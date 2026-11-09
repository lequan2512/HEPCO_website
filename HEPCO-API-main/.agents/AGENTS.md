# Antigravity Skill: HEPCO API Project

This document outlines the coding standards, architecture, and best practices for developing the **HEPCO-API** backend application using Node.js, Express.js, MySQL, and Prisma ORM.

## 1. Tech Stack Overview
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Prisma (`@prisma/client`)
- **Authentication:** JWT (`jsonwebtoken`)

---

## 2. Directory Structure
```text
src/
├── index.js             # Main application entry point (mounts routes, middleware)
├── db.js                # Shared Prisma client instance
├── routes/              # Express route definitions
├── controllers/         # Request handling, validation, and business logic
├── models/              # Data access layer (Prisma queries live here)
├── middlewares/         # Middleware (IP Whitelist, JWT Auth, Error Handler)
└── utils/               # AppError class, helper functions, shared constants
prisma/
├── schema.prisma        # Prisma schema: datasource (MySQL), generator, and all models
└── migrations/          # Prisma-generated migration history
```

---

## 3. Architectural Rules
- **Naming Conventions:**
  - Routes: `[feature].routes.js` (e.g., `news.routes.js`, `supplier.routes.js`)
  - Controllers: `[feature].controller.js` (e.g., `news.controller.js`, `supplier.controller.js`)
  - Models: `[feature].model.js` (e.g., `news.model.js`, `supplier.model.js`)
- **Routes:** Only map HTTP endpoints to controller functions using `express.Router()`. Do not write business logic or database queries inside route files.
- **Controllers:** Handle HTTP requests and responses (`req`, `res`). Extract and validate payload, invoke Models for database operations, and send formatted JSON responses.
- **Database Queries (Models):** Controllers MUST NOT call `prisma` directly. ALL database operations MUST reside inside `src/models/[feature].model.js` using the shared Prisma client (`const { prisma } = require('../db');`).

---

## 4. Constants and No-Hardcode Policy
- **NO Hardcoding:** Never hardcode magic strings, statuses, or configuration values in business logic.
- **Standard Enum Pattern (CRITICAL):**
  Whenever a status or type enum is defined for the backend, create constants in `src/constants/` or `src/utils/constants.js`:
  ```javascript
  const POS_STATUS = {
    IN_STOCK: 'in_stock',
    IN_USE: 'in_use',
    BORROWED: 'borrowed',
    BROKEN: 'broken',
    RETIRED: 'retired'
  };

  const EMPLOYEE_TYPE = {
    FEE_COLLECTOR: 1,
    OFFICE_STAFF: 2
  };
  ```
- **English Keys Rule:** Always use English uppercase identifiers for Enum keys (e.g., `FEE_COLLECTOR`, `OFFICE_STAFF`, `ACTIVE`, `INACTIVE`) and numeric or standardized values.

---

## 5. Security & Authentication Rules
- **JWT Authentication:** Secure protected API endpoints using Bearer Token authorization headers.
- **IP Whitelisting:** Any sensitive endpoints (login, mutations) MUST verify client IP address against the `IpWhitelist` database table before execution. Reject unauthorized IPs with HTTP 403 Forbidden.

---

## 6. API Response & Pagination Standards
- **List API Response Structure:** All GET endpoints returning lists MUST return paginated data adhering strictly to this JSON response:
  ```json
  {
      "data": [
          // ... array of items ...
      ],
      "meta": {
          "total": 100,
          "page": 1,
          "limit": 20,
          "totalPages": 5
      }
  }
  ```
- **Error Response Format:** ALL errors MUST return JSON adhering to:
  ```json
  {
      "errorCode": "STRING_CODE",
      "message": "English description"
  }
  ```
  Pass errors to `next(new AppError('ERROR_CODE', statusCode, message))` and let global `errorHandler` middleware process the response.
- **Language:** ALL code comments, documentation, and error codes MUST be in ENGLISH.

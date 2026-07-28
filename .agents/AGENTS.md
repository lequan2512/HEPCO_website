# Antigravity Skill: HEPCO Project

This document outlines the coding standards, architecture, and best practices for developing the **HEPCO** web application using ReactJS, TailwindCSS v4, and SCSS.

## 1. Tech Stack Overview
- **Framework:** React 19 (via Vite)
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4 + SCSS
- **Forms & Validation:** Formik + Yup
- **State Management:** Zustand (Global State) & @tanstack/react-query (Server State)
- **Icons:** Lucide React (`lucide-react`)
- **Build Tool:** Vite

---

## 2. File and Directory Structure
Maintain a clean and modular folder structure inside the `src/` directory. Each page should be encapsulated within its own folder, containing its specific components:

```text
src/
├── assets/          # Static files (images, fonts)
├── components/      # Global/Reusable UI components across multiple pages (Header, Footer, Button, etc.)
├── pages/           # Page-level directories
│   ├── Home/        # Folder for the Home page
│   │   ├── index.jsx          # Entry component for the Home page
│   │   └── components/        # Components specific ONLY to the Home page (e.g., HeroSection.jsx)
│   ├── About/       # Folder for the About page
│   │   ├── index.jsx
│   │   └── components/
│   └── ...
├── services/        # API call layer (Axios/fetch instances + react-query hooks per feature)
│   ├── axiosClient.js         # Shared Axios instance (baseURL, interceptors, auth headers)
│   ├── auth.service.js        # Example: API calls for authentication
│   └── news.service.js        # Example: API calls for a "news" feature
├── utils/           # Generic helper functions & shared constants (NOT tied to a single page)
│   ├── constants.js            # App-wide constants/enums (see Section 10)
│   ├── formatDate.js           # Example utility helper
│   └── validators.js           # Example: shared Yup schema fragments/helpers
├── styles/          # Global SCSS files (if needed to separate from index.css)
├── App.jsx          # Main application component & Router configuration
├── index.css        # Global CSS (Tailwind entry point & theme variables)
└── main.jsx         # React application entry point
```

### Frontend `services/` and `utils/` conventions
- **`services/`** — Owns all backend communication. Every feature/domain that talks to the API gets its own file: `[feature].service.js` (e.g., `news.service.js`, `employee.service.js`). Each file exports plain functions (e.g., `getNewsList`, `createNews`) that wrap `axiosClient` calls. These functions are then consumed by `@tanstack/react-query` hooks (either inline in the page, or in a co-located `use[Feature].js` hook file). **Components must never call `axios`/`fetch` directly** — always go through a `services/*.service.js` function.
- **`utils/`** — Owns pure, stateless helper logic shared across the app (formatting, calculations, validation helpers, generic constants/enums). If a helper is only used by one page, keep it in that page's local `components/` folder instead of `utils/`. Naming follows `camelCase.js` per Section 3.
- **Rule of thumb:** `services/` = "how we talk to the backend." `utils/` = "how we transform/format data we already have." Do not mix API-calling logic into `utils/`.

---

## 3. Component Conventions
- **Functional Components:** Always use functional components with React Hooks (`useState`, `useEffect`, etc.).
- **Arrow Functions:** Use arrow function syntax for component definitions.
  ```jsx
  const MyComponent = ({ propName }) => {
    return <div>{propName}</div>;
  };
  export default MyComponent;
  ```
- **One Component Per File:** Each file should export only one main component.
- **Naming:** 
  - Shared Components: `PascalCase.jsx` (e.g., `PageBanner.jsx`, `Button.jsx`).
  - Pages: Use a folder named in `PascalCase` (e.g., `Home/`) containing an `index.jsx` as the entry file.
  - Page-specific Components: Placed in the page's `components/` folder, named in `PascalCase.jsx`.
  - Helper functions/hooks: `camelCase.js` (e.g., `useFetchData.js`, `formatDate.js`).
  - Services: `camelCase` with `.service.js` suffix (e.g., `news.service.js`).

---

## 4. Styling Guidelines (Tailwind CSS + SCSS)
- **Primary Styling Tool:** Use Tailwind CSS utility classes for 90% of styling (layout, spacing, typography, colors).
- **Tailwind v4 Setup:** Tailwind is imported via `@import "tailwindcss";` in `index.css`. Theme variables (colors, fonts) are defined using the `@theme` directive in CSS.
- **Custom Brand Colors:**
  - Green: `bg-hepco-green`, `text-hepco-green`
  - Orange: `bg-hepco-orange`, `text-hepco-orange`
- **UI Consistency Rule (CRITICAL):**
  - When creating a new screen (e.g., an Admin List, Form, Modal, Table, Search Bar, or Empty State), it **MUST exactly mirror** the HTML structure, DOM nesting, and Tailwind CSS classes of existing screens with similar functionalities. 
  - **Do not invent new layout structures or use different utility classes.** Always cross-reference an existing functional page (e.g., `AdminEmployeeManager`) and perfectly clone its structural implementation for headers, tables, empty states, and action buttons.
  - **Table Loading Pattern (CRITICAL):** When fetching/loading list or table data, **NEVER** return an early `<Loading />` component that unmounts or replaces the entire page layout. The Top Header, Search Input, Filters, and Action Buttons MUST remain visible. The `<Loading />` state MUST be rendered strictly inside the Table Container Box (`<div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[300px] flex flex-col justify-center"> {isLoading ? <Loading /> : ...} </div>`).
- **When to use SCSS:**
  - Use SCSS only for complex animations, highly customized pseudo-elements (`::before`, `::after`), or nested component styles that are too verbose for Tailwind utility classes.
  - Complex custom shapes (like `clip-path`) can be defined in a `.scss` or `.css` utility layer.
- **Responsive Design:** Follow mobile-first approach using Tailwind's `md:`, `lg:`, `xl:` prefixes.

---

## 5. Routing Guidelines
- Use `<NavLink>` from `react-router-dom` for navigation menus to easily apply active states.
- Define all routes in `App.jsx` inside the `<Routes>` block.
- Create placeholder pages (`GenericPage.jsx`) for incomplete routes to prevent 404 errors during development.

---

## 6. Icons & Media
- Use `lucide-react` for standard UI icons.
- **Important Note:** `lucide-react` does not support brand icons (Facebook, Youtube, Zalo, etc.). For brand logos, use raw SVG code or standard `<img>` tags pointing to `src/assets/img`.
- Ensure all images have `alt` attributes for accessibility.

---

## 7. State Management, Data Fetching & Forms
- **Local State:** Use `useState` and `useReducer` for local component state. Keep components "dumb" when possible, passing state down via props.
- **Global State:** Use **Zustand** for scalable global state management instead of Context API or Redux.
- **Server State / API:** Use **@tanstack/react-query** for fetching, caching, and synchronizing asynchronous data from the backend. React Query hooks call functions exported from `src/services/`, never raw `axios`/`fetch` inline in components.
- **Form Management:** All forms MUST use **Formik** for handling form states and **Yup** for schema-based validation.

## 8. Anti-Patterns to Avoid
- Avoid direct DOM manipulation (e.g., `document.getElementById`).
- Do not use inline styles unless dynamically calculated (e.g., `style={{ backgroundImage: url(...) }}`). Use Tailwind classes instead.
- Do not duplicate standard Tailwind utility configurations in custom SCSS.
- Do not call `axios`/`fetch` directly inside components or pages — route all API calls through `src/services/`.

---

## 9. Backend Standards (HEPCO-API - Node.js & Express.js)
The backend follows a strict MVC-like architecture, separating routing, business logic, and database operations for scalability and maintainability.

- **Tech Stack:** Node.js, Express.js, **MySQL** as the database, with **Prisma** as the ORM (`@prisma/client`).
- **Directory Structure:**
  ```text
  src/
  ├── index.js             # Main application entry point (mounts routes, middleware)
  ├── routes/              # Route definitions
  ├── controllers/         # Request handling, validation, and business logic
  └── models/              # Data access layer (Prisma queries live here)
  prisma/
  ├── schema.prisma        # Prisma schema: datasource (MySQL), generator, and all models
  └── migrations/          # Prisma-generated migration history
  ```
- **Prisma Setup Notes:**
  - `prisma/schema.prisma` defines `datasource db { provider = "mysql", url = env("DATABASE_URL") }`.
  - Instantiate a single shared `PrismaClient` (e.g., in `src/db.js`) and import it wherever needed — do not create multiple `PrismaClient` instances across the app.
  - There is no manual "connection pool" setup like the raw `mssql` driver; Prisma manages pooling internally via the `DATABASE_URL` connection string.
- **Naming Conventions:**
  - Routes: `[feature].routes.js` (e.g., `news.routes.js`)
  - Controllers: `[feature].controller.js` (e.g., `news.controller.js`)
  - Models: `[feature].model.js` (e.g., `news.model.js`)
- **Architectural Rules:**
  - **Routes:** Only map endpoints to controller functions. Do not write business logic or database queries here. Use `express.Router()`.
  - **Controllers:** Handle HTTP requests and responses (`req`, `res`). Extract data from request, validate, call Models for data operations, and send formatted JSON responses.
  - **Database Queries:** Controllers/Services MUST NOT call `prisma` directly. ALL database logic MUST reside in `src/models/`, using the shared Prisma client (e.g., `prisma.news.findMany(...)`).
- **Security & Authentication Rules:**
  - **JWT Authentication:** Use Bearer Tokens (`jsonwebtoken`) for authenticating API requests.
  - **IP Whitelisting:** Any sensitive API endpoints—such as login, creating data, or editing information—MUST verify that the client's IP address exists in the `IpWhitelist` database table before execution. Requests from unlisted IPs should be immediately rejected with a `403 Forbidden` status.
- **Error Handling:** ALL errors MUST return JSON: { "errorCode": "STRING_CODE", "message": "English description" } via AppError class. Let the global error handler middleware send the response.
- **Language:** ALL code comments and documentation MUST be in ENGLISH.

---

## 10. Constants and No-Hardcode Policy
- **NO Hardcoding:** Never hardcode magic strings, statuses, configuration values, or enums directly in the business logic or UI components.
- **Standard Enum Pattern (CRITICAL):**
  Whenever a data type enum or status is created in the project, it **MUST** be defined in a constant file (e.g., `src/constants/[domain].js`) following this 3-tier structure containing `value`, `label`, `bg` (colors/styles), and `OPTIONS`:
  ```javascript
  export const POS_STATUS = {
    IN_STOCK: 'in_stock',
    IN_USE: 'in_use',
    BORROWED: 'borrowed',
    BROKEN: 'broken',
    RETIRED: 'retired'
  };

  export const POS_STATUS_LABELS = {
    [POS_STATUS.IN_STOCK]: { value: POS_STATUS.IN_STOCK, label: 'Kho/Dự phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
    [POS_STATUS.IN_USE]: { value: POS_STATUS.IN_USE, label: 'Đang cấp phát', bg: 'bg-green-100 text-green-800 border-green-200' },
    [POS_STATUS.BORROWED]: { value: POS_STATUS.BORROWED, label: 'Đang mượn', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    [POS_STATUS.BROKEN]: { value: POS_STATUS.BROKEN, label: 'Đang hỏng', bg: 'bg-red-100 text-red-800 border-red-200' },
    [POS_STATUS.RETIRED]: { value: POS_STATUS.RETIRED, label: 'Thanh lý', bg: 'bg-gray-100 text-gray-800 border-gray-200' }
  };

  export const POS_STATUS_OPTIONS = Object.values(POS_STATUS_LABELS);

  export const EMPLOYEE_TYPE = {
    FEE_COLLECTOR: 1,
    OFFICE_STAFF: 2
  };

  export const EMPLOYEE_TYPE_LABELS = {
    [EMPLOYEE_TYPE.FEE_COLLECTOR]: { value: EMPLOYEE_TYPE.FEE_COLLECTOR, label: 'NV Thu phí', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
    [EMPLOYEE_TYPE.OFFICE_STAFF]: { value: EMPLOYEE_TYPE.OFFICE_STAFF, label: 'NV Văn phòng', bg: 'bg-blue-100 text-blue-800 border-blue-200' }
  };

  export const EMPLOYEE_TYPE_OPTIONS = Object.values(EMPLOYEE_TYPE_LABELS);
  ```
- **English Keys Rule:** Always use English uppercase identifiers for Enum keys (e.g., `FEE_COLLECTOR`, `OFFICE_STAFF`, `ACTIVE`, `INACTIVE`) and numeric or standardized values.
- **Enum & Constants Definition Location:**
  - **Frontend:** Define in `src/constants/[domain].js` or `src/utils/constants.js`.
  - **Backend:** Define in a dedicated `src/constants/` or `src/utils/constants.js` file, exported for reuse across controllers and models.
- **Import to Use:** Import these defined constants wherever needed in both Frontend and Backend to ensure consistency and prevent typos. For example, instead of `if (status === 'in_stock')`, use `if (status === POS_STATUS.IN_STOCK)`.

## 11. API Response & Pagination Standards
- **List API Format:** All APIs returning a list of items MUST be paginated and follow this exact response structure to ensure consistency across the Frontend:
  ```json
  {
      "data": [
          // ... array of items ...
      ],
      "meta": {
          "total": 3,
          "page": 1,
          "limit": 20,
          "totalPages": 1
      }
  }
  ```
- **Error Response Format:** When returning an error, the API MUST return an object containing at least `errorCode` and `message` so the Frontend can map and display them accordingly.
- **Frontend Pagination UI:** All Frontend list screens MUST use the common `src/components/Pagination.jsx` component.
  - Usage: `<Pagination meta={apiResponse.meta} onPageChange={setPage} />`
  - Do not hardcode `limit: 1000` just to bypass pagination unless absolutely necessary for a dropdown.

---

## 12. Code Editing & Lint Verification Protocol
- **MANDATORY LINT VERIFICATION (CRITICAL):** Whenever Antigravity finishes modifying or creating code files in the codebase, it **MUST automatically run `npm run lint`** to verify that there are no syntax errors, undefined variables, broken imports, or lint violations introduced by the changes.
- Any lint warnings or errors detected during the check MUST be resolved immediately before completing the task.

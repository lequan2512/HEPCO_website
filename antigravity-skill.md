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
├── styles/          # Global SCSS files (if needed to separate from index.css)
├── App.jsx          # Main application component & Router configuration
├── index.css        # Global CSS (Tailwind entry point & theme variables)
└── main.jsx         # React application entry point
```

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

---

## 4. Styling Guidelines (Tailwind CSS + SCSS)
- **Primary Styling Tool:** Use Tailwind CSS utility classes for 90% of styling (layout, spacing, typography, colors).
- **Tailwind v4 Setup:** Tailwind is imported via `@import "tailwindcss";` in `index.css`. Theme variables (colors, fonts) are defined using the `@theme` directive in CSS.
- **Custom Brand Colors:**
  - Green: `bg-hepco-green`, `text-hepco-green`
  - Orange: `bg-hepco-orange`, `text-hepco-orange`
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
- **Server State / API:** Use **@tanstack/react-query** for fetching, caching, and synchronizing asynchronous data from the backend.
- **Form Management:** All forms MUST use **Formik** for handling form states and **Yup** for schema-based validation.

## 8. Anti-Patterns to Avoid
- Avoid direct DOM manipulation (e.g., `document.getElementById`).
- Do not use inline styles unless dynamically calculated (e.g., `style={{ backgroundImage: url(...) }}`). Use Tailwind classes instead.
- Do not duplicate standard Tailwind utility configurations in custom SCSS.

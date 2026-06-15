# Antigravity Skill: HEPCO Project

This document outlines the coding standards, architecture, and best practices for developing the **HEPCO** web application using ReactJS, TailwindCSS v4, and SCSS.

## 1. Tech Stack Overview
- **Framework:** React 19 (via Vite)
- **Routing:** React Router DOM (v6+)
- **Styling:** Tailwind CSS v4 + SCSS
- **Icons:** Lucide React (`lucide-react`)
- **Build Tool:** Vite

---

## 2. File and Directory Structure
Maintain a clean and modular folder structure inside the `src/` directory:

```text
src/
├── assets/          # Static files (images, fonts)
├── components/      # Reusable UI components (Header, Footer, Buttons, etc.)
├── pages/           # Page-level components (Home, About, Services, etc.)
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
  - Components & Pages: `PascalCase.jsx` (e.g., `PageBanner.jsx`, `Home.jsx`).
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

## 7. State Management
- Use `useState` and `useReducer` for local component state.
- Keep components "dumb" (presentation only) when possible, passing state down via props.

## 8. Anti-Patterns to Avoid
- Avoid direct DOM manipulation (e.g., `document.getElementById`).
- Do not use inline styles unless dynamically calculated (e.g., `style={{ backgroundImage: url(...) }}`). Use Tailwind classes instead.
- Do not duplicate standard Tailwind utility configurations in custom SCSS.

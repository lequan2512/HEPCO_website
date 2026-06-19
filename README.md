# HEPCO Website Source Code

This project is the frontend source code for the HEPCO corporate website, built using modern web technologies to ensure a responsive, high-performance, and visually appealing user experience.

## Technologies Used

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 & Sass
- **Routing:** React Router v7
- **Icons:** Lucide React

## Prerequisites

Before running this project, please ensure you have the following installed on your local machine:
- Node.js (version 18 or higher recommended)
- npm (Node Package Manager)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Installation

First, navigate to the project directory in your terminal and install the required dependencies:

```bash
npm install
```

### 2. Development Server

To start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will typically run at `http://localhost:5173/`. Check your terminal output for the exact local URL.

### 3. Building for Production

To create an optimized production build of your application:

```bash
npm run build
```

This will generate a `dist` folder containing the compiled static files, which can be deployed to any static hosting service.

### 4. Previewing the Build

To preview the production build locally before deployment:

```bash
npm run preview
```

### 5. Linting

To run ESLint and check your code for formatting or syntax errors:

```bash
npm run lint
```

## Project Structure

The main source code is located in the `src` directory.
- Components, pages, and routing logic are implemented within `src`.
- Static assets (images, icons) that don't require processing can be placed in the `public` folder.
- Styling configurations are managed through Tailwind CSS and Sass files.

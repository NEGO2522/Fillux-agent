# Fillux

**Fillux** is a profile management web application that lets you store your personal, academic, and document details once — and access them instantly whenever you need to fill out forms or applications.

Built with **React**, **Tailwind CSS**, **Firebase**, and **Cloudinary**.

---

## Overview

Filling out the same information repeatedly across job applications, college forms, and registrations is tedious. Fillux solves this by giving you a single, secure profile that stores everything — so your data is always ready when you need it.

---

## Features

- **Centralized Profile** — Store personal details, academic information, and contact data in one place via Firebase Firestore.
- **Document Management** — Upload and manage your Resume and College ID securely through Cloudinary.
- **Google Authentication** — Sign in quickly and securely using Firebase Authentication with Google OAuth support.
- **Chrome Extension Support** — Access your profile data directly from the browser via the Fillux Chrome Extension.
- **Responsive UI** — Clean, dark-themed interface built with Tailwind CSS, optimized for both desktop and mobile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router DOM |
| Styling | Tailwind CSS v4 |
| Auth & Database | Firebase Authentication, Firestore |
| File Storage | Cloudinary |
| Build Tool | Vite |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Firebase project with Firestore and Authentication enabled
- A Cloudinary account with an upload preset configured

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fillux.git
cd fillux
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 5. Build for Production

```bash
npm run build
```

---

## Project Structure

```
fillux/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images and icons
│   ├── components/          # Reusable UI components
│   │   ├── Contact.jsx
│   │   └── ProfileIcon.jsx
│   ├── contexts/            # React context providers
│   ├── firebase/            # Firebase initialization and config
│   ├── pages/               # Application pages
│   │   ├── Home.jsx         # Dashboard
│   │   ├── Login.jsx        # Authentication
│   │   ├── Form.jsx         # Profile setup
│   │   ├── ExtensionPopup.jsx  # Chrome extension interface
│   │   └── Privacy.jsx      # Privacy policy
│   ├── App.jsx              # Route configuration
│   └── main.jsx             # Application entry point
├── index.html
├── vite.config.js
└── vercel.json
```

---

## Application Flow

1. **Landing** — Users are introduced to Fillux and its purpose.
2. **Authentication** — Sign in with Google via Firebase Auth.
3. **Profile Setup** — Complete the profile form with personal, academic, and document details.
4. **Dashboard** — View and manage your stored profile, with a link to the Chrome Extension.
5. **Extension** — Access profile data directly in the browser without visiting the web app.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## License

This project is licensed under the [MIT License](./LICENSE).

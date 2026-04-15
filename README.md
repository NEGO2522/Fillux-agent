# Fillux

**Fillux** is a smart form autofill platform that lets you save your profile details once and fill any web form instantly — job applications, hackathons, events, registrations, and more.

It ships as both a **web app** and a **Chrome Extension**, backed by **Supabase** for authentication and data storage, and **Cloudinary** for document uploads.

---

## Overview

Filling out the same information repeatedly across every platform is tedious. Fillux solves this by giving you a single, secure profile that stores everything — your personal details, academic info, resume, and more — so your data is always ready when you need it.

The Chrome Extension reads any form on any website and fills it in one click using your saved profile.

---

## Features

- **One-click form autofill** — Detects form fields on any page and fills them instantly using your profile via the Chrome Extension.
- **Centralized profile storage** — Personal details, academic info, and links saved securely in Supabase Postgres.
- **Document uploads** — Resume and College Photo ID uploaded and stored via Cloudinary.
- **Email & password authentication** — Sign up and sign in via Supabase Auth with full session management.
- **Chrome Extension support** — Dedicated extension popup for profile setup and form filling directly in the browser.
- **Responsive web dashboard** — Manage your profile from any device via the Fillux web app.
- **Works on major platforms** — Unstop, Devpost, Devfolio, DoraHacks, HackerEarth, HackerRank, MLH, Kaggle, Google Forms, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase (Auth + Postgres) |
| File Storage | Cloudinary |
| Build Tool | Vite 8 |
| Deployment | Vercel |

---

## Project Structure

```
fillux/
├── public/                        # Static assets
├── src/
│   ├── assets/                    # Images and icons
│   ├── components/                # Reusable UI components
│   │   ├── Contact.jsx
│   │   └── ProfileIcon.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx        # Supabase session context
│   ├── firebase/
│   │   └── firebase.js            # Supabase client initialization
│   ├── pages/
│   │   ├── Home.jsx               # Dashboard with autofill trigger
│   │   ├── Login.jsx              # Sign in / sign up
│   │   ├── Form.jsx               # Full profile setup page
│   │   ├── ExtensionPopup.jsx     # Chrome extension UI
│   │   └── Privacy.jsx            # Privacy policy
│   ├── App.jsx                    # Route configuration (web + extension)
│   └── main.jsx                   # Application entry point
├── index.html
├── vite.config.js                 # Vite config with relative base for extension
├── vercel.json
└── BUILD_AND_INSTALL.bat          # Extension build & install script
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com) project with Authentication enabled and a `profiles` table
- A [Cloudinary](https://cloudinary.com) account with an unsigned upload preset configured

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

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:5175` in your browser.

### 5. Build for Production

```bash
npm run build
```

---

## Supabase Setup

Create a `profiles` table in your Supabase project with the following key columns:

| Column | Type | Notes |
|---|---|---|
| `uid` | `text` | Primary key — maps to Supabase Auth user ID |
| `email` | `text` | |
| `firstName` | `text` | |
| `lastName` | `text` | |
| `phone` | `text` | |
| `collegeName` | `text` | |
| `degreeName` | `text` | |
| `year` | `text` | |
| `expectedGraduationYear` | `text` | |
| `resumeURL` | `text` | Cloudinary URL |
| `collegePhotoURL` | `text` | Cloudinary URL |
| `yesNoFields` | `jsonb` | Hackathon quick-answer fields |
| `termsAccepted` | `boolean` | |
| `updatedAt` | `text` | ISO timestamp |

Enable Row Level Security (RLS) and add a policy so users can only read and write their own rows using `auth.uid()::text = uid`.

---

## Chrome Extension

The same codebase powers the Chrome Extension. Vite is configured with `base: './'` to generate relative asset paths required for extension contexts.

To install the extension locally:

1. Run `npm run build` to generate the `dist/` folder, or run `BUILD_AND_INSTALL.bat` on Windows.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist/` folder.

The extension detects when it is running inside Chrome (`chrome.runtime.id`) and renders the `ExtensionPopup` interface instead of the web dashboard routes.

---

## Application Flow

1. **Authentication** — Sign up or sign in with email and password via Supabase Auth.
2. **Profile setup** — Complete your profile including personal details, academic info, resume upload (required), and optional College Photo ID.
3. **Dashboard** — View your profile status and trigger autofill from the web app.
4. **Chrome Extension** — Open the extension popup on any form page and click "Fill This Page" to autofill all matching fields instantly.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the app and extension for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## License

This project is licensed under the [MIT License](./LICENSE).

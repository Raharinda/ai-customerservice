# AI-Powered Customer Service Platform

> An AI-powered customer service platform with automatic message analysis, issue classification, sentiment understanding, and intelligent response suggestions.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [How to Use](#-how-to-use)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 📖 About the Project

**AI-Powered Customer Service** is a modern customer service platform that leverages artificial intelligence to help businesses provide faster and more efficient support. The platform is designed with two separate portals: one for customers and one for support agents.

### Why This Project?

- **Intelligent Automation**: AI helps classify and prioritize tickets automatically
- **Faster Response**: Agents receive AI-powered answer suggestions
- **Best Experience**: Clean and user-friendly interface
- **Scalability**: Capable of handling thousands of tickets with optimal performance

---

## ✨ Key Features

### 👤 Customer Portal
- 📝 **Create Support Tickets** - Submit issues with clear categories
- 💬 **Real-time Chat** - Direct communication with agents
- 📊 **Status Tracking** - Monitor your ticket progress
- 🔔 **Notifications** - Get updates when there are replies

### 👨‍💼 Agent Portal
- 🎫 **Unified Dashboard** - Manage all tickets in one place
- 🤖 **AI Assistant** - AI-powered automatic response suggestions
- 🏷️ **Auto-Classification** - Automatic category and priority assignment
- 😊 **Sentiment Analysis** - Detect customer emotions
- 📈 **Analytics** - Statistics and performance reports

### 🔐 Security
- **Dual Authentication** - Separate login for customers and agents
- **Role-Based Access** - Access restrictions based on roles
- **Agent Key System** - Additional verification for agents
- **Firebase Auth** - Secure and trusted authentication system

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework untuk production
- **[React 18](https://react.dev/)** - Library UI modern
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide Icons](https://lucide.dev/)** - Icon set yang clean

### Backend & Database
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - Autentikasi user yang aman
- **[Cloud Firestore](https://firebase.google.com/products/firestore)** - NoSQL database real-time
- **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** - Server-side operations

### AI & Machine Learning
- **AI Classification** - Klasifikasi otomatis kategori tiket
- **Sentiment Analysis** - Analisis emosi pelanggan
- **Smart Suggestions** - Rekomendasi respons berbasis AI

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Firebase CLI](https://firebase.google.com/docs/cli)** - Deployment tools

---

## 🏁 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js](https://nodejs.org/)** version 18 or higher
- **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/)**
- **[Firebase Project](https://firebase.google.com/)** with:
  - Firestore Database enabled
  - Authentication enabled (Email/Password & Google Sign-in)
  - Firebase Admin SDK credentials

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Raharinda/ai-customerservice.git
cd ai-customerservice
```

**2. Install dependencies**

```bash
npm install
# or
yarn install
```

**3. Setup Environment Variables**

Create a `.env.local` file in the root directory:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Server Configuration
PORT=3001

# Agent Key (CHANGE THIS IN PRODUCTION!)
AGENT_KEY=support-agent-key-2026-secure
```

### 📝 How to Get Firebase Credentials

#### A. Firebase Web Config (`NEXT_PUBLIC_*` variables)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ (Settings) → **Project Settings**
4. Scroll down to **"Your apps"** section
5. Select your web app (or create new by clicking **"Add app"** → **Web**)
6. Copy the config values displayed:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
     authDomain: "...",          // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     projectId: "...",           // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
     storageBucket: "...",       // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "...",   // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     appId: "..."                // → NEXT_PUBLIC_FIREBASE_APP_ID
   };
   ```

#### B. Firebase Admin SDK Credentials

1. In Firebase Console, go to **Project Settings** → **Service Accounts** tab
2. Click **"Generate new private key"**
3. Download the JSON file
4. Open the JSON file and extract the following values:
   ```json
   {
     "project_id": "...",           // → FIREBASE_PROJECT_ID
     "private_key": "...",          // → FIREBASE_PRIVATE_KEY
     "client_email": "..."          // → FIREBASE_CLIENT_EMAIL
   }
   ```
5. ⚠️ **Important**: Keep the private key format with `\n` characters for line breaks

#### C. Agent Key

- Default: `support-agent-key-2026-secure`
- ⚠️ **CHANGE THIS IN PRODUCTION!**
- Use a strong, random string (recommended: 32+ characters)
- Example: `your-super-secret-agent-key-2026-change-me`

**4. Run the development server**

```bash
npm run dev
# or
yarn dev
```

**5. Open your browser**

Navigate to [http://localhost:3001](http://localhost:3001)

---

## 🎯 How to Use

### For Customers

1. **Access the Platform**
   - Open the website in your browser
   - Click **"Continue as Customer"** button

2. **Login or Register**
   - Use email & password, or
   - Sign in with Google account

3. **Create Support Ticket**
   - Click **"Create New Request"** button
   - Fill in the form:
     - **Subject**: Brief title of your issue
     - **Category**: Select category (Technical Issue, Billing, etc.)
     - **Description**: Explain your problem in detail
   - Click **Submit**

4. **Track Your Tickets**
   - View all your tickets in the dashboard
   - Click on a ticket to see details and chat with agents
   - Get notifications when there are updates

### For Support Agents

1. **Agent Login**
   - Click **"Continue as Agent"** button
   - Enter:
     - Email
     - Password
     - **Agent Key** (special key for agents)

2. **Agent Dashboard**
   - View all incoming tickets
   - Filter by:
     - Status (Open, In Progress, Resolved)
     - Priority (Low, Medium, High, Urgent)
     - Category

3. **Manage Tickets**
   - Click on a ticket to view details
   - Review AI analysis:
     - Auto-categorization
     - Priority level
     - Customer sentiment
   - Use AI-suggested responses
   - Reply to customer messages
   - Update ticket status

4. **AI Features**
   - **Auto-Classification**: System automatically categorizes tickets
   - **Priority Detection**: AI determines urgency level
   - **Sentiment Analysis**: Understand customer emotions (positive, neutral, negative)
   - **Response Suggestions**: Get AI-generated reply drafts

---

## 📁 Project Structure

```
ai-customerservice/
├── src/
│   ├── app/
│   │   ├── agent/
│   │   │   ├── page.js                    # Agent login page
│   │   │   └── dashboard/
│   │   │       └── page.js                # Agent dashboard (protected)
│   │   ├── (public)/
│   │   │   ├── customer/                  # Customer dashboard
│   │   │   ├── login/                     # Customer login page
│   │   │   └── register/                  # Registration page
│   │   └── api/
│   │       └── auth/
│   │           ├── login/                 # Customer login API
│   │           ├── register/              # Registration API
│   │           └── agent/
│   │               └── login/             # Agent login API (with key)
│   ├── components/
│   │   └── auth/                          # Auth components (LoginForm, etc.)
│   ├── contexts/
│   │   └── AuthContext.js                 # Authentication context
│   └── lib/
│       ├── firebase.js                    # Firebase client config
│       └── firebaseAdmin.js               # Firebase Admin SDK config
├── public/                                 # Static assets
├── .env.local                             # Environment variables (create this)
├── package.json                           # Project dependencies
└── README.md                              # This file
```

---

## 🔐 Authentication Flow

### Customer Login Flow

```
User → Homepage → "Continue as Customer"
  ↓
Navigate to /login
  ↓
Choose login method:
  • Email/Password
  • Google OAuth
  ↓
API: POST /api/auth/login
  ↓
Redirect to /customer (Customer Dashboard)
```

### Agent Login Flow

```
User → Homepage → "Continue as Agent"
  ↓
Navigate to /agent
  ↓
Enter credentials:
  • Email
  • Password
  • Agent Key (default: support-agent-key-2026-secure)
  ↓
API: POST /api/auth/agent/login
  ↓
Verify agent key & update role to 'agent'
  ↓
Redirect to /agent/dashboard (Agent Dashboard)
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### How to Contribute

1. **Fork the repository**
   - Click the "Fork" button at the top right of this page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ai-customerservice.git
   cd ai-customerservice
   ```

3. **Create a new branch**
   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b fix/bug-fix
   ```

4. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments where necessary
   - Test your changes thoroughly

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add some amazing feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes in detail

### Contribution Guidelines

- **Code Style**: Follow the existing code formatting
- **Commits**: Write clear, descriptive commit messages
- **Testing**: Test your changes before submitting
- **Documentation**: Update README if you add new features
- **Issues**: Check existing issues before creating new ones

### Areas to Contribute

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌐 Translations/i18n
- ⚡ Performance optimizations

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**⭐ If you find this project helpful, please give it a star! ⭐**

Made with ❤️ by [Raharinda](https://github.com/Raharinda)

</div>

# API Documentation - Customer Service AI Platform

**Version:** 2.0  
**Last Updated:** January 27, 2026  
**Base URL:** `http://localhost:3000`

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Database Structure](#database-structure)
3. [AI Analysis Flow](#ai-analysis-flow)
4. [Authentication API](#authentication-api)
5. [Tickets API](#tickets-api)
6. [AI Analysis API](#ai-analysis-api)
7. [Agent API](#agent-api)
8. [Environment Variables](#environment-variables)
9. [Changelog](#changelog)

---

## Overview

Platform customer service dengan AI-powered ticket analysis menggunakan **Google Gemini 2.5 Flash**.

### ✨ Key Features

- ✅ **Dual Authentication**: Customer & Agent login terpisah
- ✅ **Unified Tickets System**: Tickets + Messages dalam satu API
- ✅ **AI Auto-Analysis**: Otomatis analyze sentiment, urgency, summary, suggested reply
- ✅ **Re-analyze Feature**: Agent dapat re-analyze dengan full conversation context
- ✅ **Real-time Updates**: Firestore onSnapshot untuk instant UI updates
- ✅ **Role-based Access**: Customer vs Agent views

### 🔄 Migration from v1

- ❌ **REMOVED**: `/api/request` endpoints (replaced dengan `/api/tickets`)
- ❌ **REMOVED**: Separate messages collection (now subcollection)
- ✅ **NEW**: AI analysis terintegrasi di tickets
- ✅ **NEW**: Re-analyze endpoint untuk full conversation analysis

---

## Database Structure

### Firestore Collections

```
📁 tickets/
  └─ {ticketId}/
      ├─ ticketId: string
      ├─ subject: string
      ├─ description: string
      ├─ category: "technical" | "billing" | "general" | "account" | "feature-request"
      ├─ status: "open" | "in-progress" | "resolved" | "closed"
      ├─ customerId: string
      ├─ customerName: string
      ├─ customerEmail: string
      ├─ createdAt: timestamp
      ├─ updatedAt: timestamp
      ├─ aiAnalysis: {
      │    status: "pending" | "processing" | "done" | "error"
      │    mood: string                    # e.g., "frustrated", "calm"
      │    sentiment: string                # "negative", "neutral", "positive"
      │    urgency: string                  # "low", "medium", "high", "critical"
      │    urgencyScore: number             # 1-100
      │    summary: string                  # max 150 chars
      │    suggestedResponse: string        # max 200 chars
      │    processedAt: timestamp
      │    reprocessRequested: boolean
      │    reprocessCount: number
      │    lastProcessedAt: timestamp
      │    conversationLength: number
      │    error: string | null
      │  }
      └─ 📁 messages/
          └─ {messageId}/
              ├─ messageId: string
              ├─ message: string
              ├─ senderId: string
              ├─ senderRole: "customer" | "agent"
              ├─ createdAt: timestamp
              └─ read: boolean

📁 users/
  └─ {userId}/
      ├─ uid: string
      ├─ email: string
      ├─ displayName: string
      ├─ role: "customer" | "agent"
      ├─ createdAt: timestamp
      └─ updatedAt: timestamp
```

---

## AI Analysis Flow

### 🆕 First-Time Analysis (Auto-triggered on Ticket Creation)

```
Customer creates ticket
  ↓
POST /api/tickets/create
  ↓
Save ticket to Firestore
  ↓
Auto-trigger AI Worker
  ↓
POST /api/ai/analyze-ticket { ticketId }
  ↓
Worker:
  1. Update status = "processing"
  2. Fetch initial message
  3. Send to Gemini AI
  4. Get: mood, urgency, summary, suggested_reply
  5. Update status = "done"
  6. Save results
  ↓
Frontend: Real-time update via onSnapshot
```

### 🔄 Re-analysis (Agent-triggered with Full Conversation)

```
Agent clicks "Re-analyze"
  ↓
POST /api/agent/tickets/{ticketId}/reanalyze
  ↓
Backend:
  1. Fetch ALL messages from subcollection
  2. Build conversation:
     "1. [Customer]: message1
      2. [Agent]: reply1
      3. [Customer]: message2..."
  3. Set reprocessRequested = true
  4. Set status = "pending"
  5. Trigger AI Worker with conversationContext
  ↓
POST /api/ai/analyze-ticket 
{ 
  ticketId, 
  conversationContext, 
  isReanalysis: true 
}
  ↓
Worker:
  1. Update status = "processing"
  2. Use FULL CONVERSATION prompt
  3. Send to Gemini AI
  4. Get updated analysis
  5. Overwrite results
  6. Increment reprocessCount
  7. Update status = "done"
  ↓
Frontend: Real-time update with new analysis
```

---

## Authentication API

Base URL: `/api/auth`

### 1. Register

Create new customer account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Success Response (200):**
```json
{
  "message": "User berhasil didaftarkan",
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "createdAt": "2026-01-27T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Email/password/name wajib diisi
- `400`: Email sudah terdaftar
- `400`: Password minimal 6 karakter

---

### 2. Customer Login

Login untuk customer.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login berhasil",
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "abc123xyz",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

**Error Responses:**
- `400`: Email dan password wajib diisi
- `401`: Email atau password salah

---

### 3. Agent Login

Login untuk support agent dengan agent key.

**Endpoint:** `POST /api/auth/agent/login`

**Request Body:**
```json
{
  "email": "agent@example.com",
  "password": "agentpass123",
  "agentKey": "support-agent-key-2026-secure"
}
```

**Success Response (200):**
```json
{
  "message": "Agent login berhasil",
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "agent123",
    "email": "agent@example.com",
    "name": "Agent Smith",
    "role": "agent"
  }
}
```

**Error Responses:**
- `400`: Email, password, dan agent key wajib diisi
- `401`: Agent key tidak valid
- `401`: Email atau password salah

**Agent Key:** Set in `.env.local` as `AGENT_KEY`

---

### 4. Verify Token

Verify Firebase ID token.

**Endpoint:** `POST /api/auth/verify`

**Request Headers:**
```
Authorization: Bearer <Firebase_ID_Token>
```

**Success Response (200):**
```json
{
  "message": "Token valid",
  "user": {
    "uid": "abc123",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Error Response:**
- `401`: Unauthorized - Token tidak valid

---

## Tickets API

Base URL: `/api/tickets`

### 5. Create Ticket

Create new support ticket. **Automatically triggers AI analysis.**

**Endpoint:** `POST /api/tickets/create`

**Authentication:** ✅ Required (Bearer Token)

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <Firebase_ID_Token>
```

**Request Body:**
```json
{
  "subject": "Tidak bisa login ke aplikasi",
  "message": "Saya tidak bisa login, muncul error authentication failed",
  "category": "technical"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subject | string | ✅ | Judul ticket (min 5 chars) |
| message | string | ✅ | Pesan awal (min 10 chars) |
| category | string | ❌ | Category type (default: "general") |

**Categories:** `technical`, `billing`, `general`, `account`, `feature-request`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Ticket berhasil dibuat",
  "data": {
    "ticketId": "abc123xyz",
    "customerId": "uid123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "subject": "Tidak bisa login ke aplikasi",
    "category": "technical",
    "status": "open",
    "createdAt": "2026-01-27T10:30:00.000Z",
    "updatedAt": "2026-01-27T10:30:00.000Z",
    "aiAnalysis": {
      "status": "pending"
    }
  }
}
```

**Error Responses:**
- `400`: Subject dan message wajib diisi
- `400`: Subject minimal 5 karakter
- `400`: Message minimal 10 karakter
- `401`: Unauthorized

**Frontend Example:**
```javascript
const { getIdToken } = useAuth();

async function createTicket(subject, message, category = 'general') {
  const token = await getIdToken();
  
  const response = await fetch('/api/tickets/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ subject, message, category }),
  });

  return await response.json();
}
```

---

### 6. Get All Tickets

Get all tickets for current user (customer sees own tickets, agent sees all).

**Endpoint:** `GET /api/tickets`

**Authentication:** ✅ Required

**Request Headers:**
```
Authorization: Bearer <Firebase_ID_Token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ticketId": "abc123",
      "subject": "Login issue",
      "status": "open",
      "category": "technical",
      "customerId": "uid123",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "createdAt": "2026-01-27T10:30:00.000Z",
      "updatedAt": "2026-01-27T11:00:00.000Z",
      "aiAnalysis": {
        "status": "done",
        "mood": "frustrated",
        "sentiment": "negative",
        "urgency": "high",
        "urgencyScore": 75,
        "summary": "Customer cannot access their account",
        "suggestedResponse": "I'll help you resolve the login issue right away.",
        "processedAt": "2026-01-27T10:30:15.000Z"
      }
    }
  ]
}
```

**Error Response:**
- `401`: Unauthorized

---

### 7. Get Ticket by ID

Get specific ticket details.

**Endpoint:** `GET /api/tickets/{ticketId}`

**Authentication:** ✅ Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "ticketId": "abc123",
    "subject": "Login issue",
    "description": "Cannot login to app",
    "status": "open",
    "category": "technical",
    "customerId": "uid123",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "createdAt": "2026-01-27T10:30:00.000Z",
    "aiAnalysis": { /* ... */ }
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Ticket not found

---

### 8. Send Message to Ticket

Send a message/reply to existing ticket.

**Endpoint:** `POST /api/tickets/{ticketId}/messages`

**Authentication:** ✅ Required

**Request Body:**
```json
{
  "message": "Hello, I'll help you with this issue."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg123",
    "message": "Hello, I'll help you with this issue.",
    "senderId": "agent123",
    "senderRole": "agent",
    "createdAt": "2026-01-27T11:00:00.000Z",
    "read": false
  }
}
```

**Error Responses:**
- `400`: Message is required
- `400`: Message minimal 1 karakter
- `401`: Unauthorized
- `404`: Ticket not found

---

### 9. Get Ticket Messages

Get all messages for a specific ticket.

**Endpoint:** `GET /api/tickets/{ticketId}/messages`

**Authentication:** ✅ Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "msg1",
      "message": "Saya tidak bisa login",
      "senderId": "customer123",
      "senderRole": "customer",
      "createdAt": "2026-01-27T10:30:00.000Z",
      "read": true
    },
    {
      "messageId": "msg2",
      "message": "I'll help you resolve this.",
      "senderId": "agent123",
      "senderRole": "agent",
      "createdAt": "2026-01-27T11:00:00.000Z",
      "read": false
    }
  ]
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Ticket not found

---

## AI Analysis API

Base URL: `/api/ai`

### 10. AI Analysis Worker (Auto-triggered)

**⚠️ Internal API** - Auto-triggered when ticket created or re-analyze requested.

**Endpoint:** `POST /api/ai/analyze-ticket`

**Request Body:**
```json
{
  "ticketId": "abc123",
  "conversationContext": "1. [Customer]: message...\n2. [Agent]: reply...",
  "isReanalysis": true
}
```

**Flow:**
1. Update status to "processing"
2. If `conversationContext` provided → use full conversation prompt
3. Else → use initial message only
4. Send to Gemini AI
5. Parse response (mood, urgency, summary, suggested_reply)
6. Save results, update status to "done"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Analysis completed successfully",
  "data": {
    "mood": "frustrated",
    "urgency": "high",
    "urgencyScore": 75,
    "summary": "Customer cannot access account",
    "suggestedResponse": "I'll help you resolve this right away."
  }
}
```

---

## Agent API

Base URL: `/api/agent`

### 11. Re-analyze Ticket with Full Conversation

**Agent only** - Trigger AI re-analysis using full conversation history.

**Endpoint:** `POST /api/agent/tickets/{ticketId}/reanalyze`

**Authentication:** ✅ Required (Agent only)

**Request Headers:**
```
Authorization: Bearer <Firebase_ID_Token>
```

**Flow:**
1. Fetch ALL messages from `tickets/{ticketId}/messages`
2. Build conversation context
3. Set `reprocessRequested = true`, `status = pending`
4. Trigger AI worker with full conversation
5. Worker sends conversation to Gemini
6. Overwrite AI analysis results
7. Increment `reprocessCount`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Re-analysis triggered successfully",
  "data": {
    "ticketId": "abc123",
    "status": "pending",
    "reprocessRequested": true,
    "messageCount": 8
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: Ticket not found
- `500`: Failed to trigger AI worker

**Frontend Example:**
```javascript
async function reanalyzeTicket(ticketId) {
  const confirmed = confirm(
    'Re-analyze this ticket with AI? This will update the analysis based on the full conversation.'
  );
  
  if (!confirmed) return;

  const token = await getIdToken();
  
  const response = await fetch(`/api/agent/tickets/${ticketId}/reanalyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (data.success) {
    alert('Re-analysis triggered! AI is processing...');
  }
  
  return data;
}
```

---

### 12. Get Agent Tickets

Get all tickets with AI analysis (agent view).

**Endpoint:** `GET /api/agent/tickets`

**Authentication:** ✅ Required (Agent only)

**Query Parameters:**
- `status` (optional): Filter by status
- `urgency` (optional): Filter by urgency level
- `category` (optional): Filter by category

**Example:**
```
GET /api/agent/tickets?urgency=high&status=open
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "ticketId": "abc123",
      "subject": "Login issue",
      "status": "open",
      "category": "technical",
      "customerName": "John Doe",
      "createdAt": "2026-01-27T10:30:00.000Z",
      "aiAnalysis": {
        "status": "done",
        "mood": "frustrated",
        "urgency": "high",
        "urgencyScore": 75,
        "summary": "Customer cannot access account",
        "suggestedResponse": "I'll help you resolve this.",
        "reprocessCount": 2,
        "lastProcessedAt": "2026-01-27T12:00:00.000Z"
      }
    }
  ],
  "stats": {
    "total": 25,
    "critical": 3,
    "high": 8,
    "medium": 10,
    "low": 4
  }
}
```

---

### 13. Get Agent Messages

Get all messages across all tickets (inbox view).

**Endpoint:** `GET /api/agent/messages`

**Authentication:** ✅ Required (Agent only)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "messageId": "msg123",
      "ticketId": "abc123",
      "message": "I need help with login",
      "senderId": "customer123",
      "senderRole": "customer",
      "customerName": "John Doe",
      "ticketSubject": "Login issue",
      "createdAt": "2026-01-27T10:30:00.000Z",
      "read": false
    }
  ]
}
```

---

## Environment Variables

Create `.env.local` file:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase Client (Web)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Server
PORT=3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Agent Key
AGENT_KEY=support-agent-key-2026-secure

# Gemini API
GEMINI_API_KEY=AIzaSy...
```

---

## Changelog

### Version 2.0 (January 27, 2026)

#### 🆕 NEW Features
- ✅ AI-powered ticket analysis dengan Gemini 2.5 Flash
- ✅ Re-analyze feature dengan full conversation context
- ✅ Unified tickets API (menggantikan separate request API)
- ✅ Real-time AI status updates
- ✅ Messages sebagai subcollection dalam tickets

#### ❌ BREAKING CHANGES
- **REMOVED** `/api/request/*` endpoints
- **REMOVED** Separate messages collection
- **CHANGED** Tickets structure (added `aiAnalysis` field)

#### 🔄 MIGRATION from v1
```javascript
// OLD (v1)
POST /api/request              → REMOVED
GET  /api/request              → REMOVED
POST /api/request/{id}/message → REMOVED

// NEW (v2)
POST /api/tickets/create       → Create ticket + auto AI analysis
GET  /api/tickets              → Get all tickets with AI data
POST /api/tickets/{id}/messages → Send message
GET  /api/tickets/{id}/messages → Get messages
POST /api/agent/tickets/{id}/reanalyze → Re-analyze with full conversation
```

#### 📊 NEW Database Fields
- `aiAnalysis.status` - AI processing status
- `aiAnalysis.mood` - Customer emotional state
- `aiAnalysis.sentiment` - Sentiment classification
- `aiAnalysis.urgency` - Urgency level
- `aiAnalysis.urgencyScore` - Numeric urgency (1-100)
- `aiAnalysis.summary` - AI-generated summary
- `aiAnalysis.suggestedResponse` - Suggested reply for agent
- `aiAnalysis.reprocessRequested` - Flag for re-analysis
- `aiAnalysis.reprocessCount` - Number of re-analyses
- `aiAnalysis.conversationLength` - Message count at analysis time

#### 🐛 Fixes
- Fixed Next.js 15+ `params` Promise handling (await params)
- Fixed Firestore composite index requirements
- Fixed incomplete JSON responses from Gemini (auto-fix logic)

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Validate Firebase ID tokens** on every protected endpoint
3. **Set proper Firestore security rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tickets/{ticketId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update: if request.auth != null;
         
         match /messages/{messageId} {
           allow read, create: if request.auth != null;
         }
       }
     }
   }
   ```
4. **Store sensitive keys in `.env.local`** (never commit to git)
5. **Rotate API keys regularly** (Gemini, Firebase)

---

## 📞 Support

For questions or issues, please contact:
- Backend Developer: [Your contact]
- Frontend Developer: [Frontend team contact]
- Documentation: This file

---

**End of Documentation**

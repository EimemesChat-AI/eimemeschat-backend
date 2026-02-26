# eimemeschat-backend
# EimemesChat AI

EimemesChat AI is a full-stack, multi-model AI chatbot platform built with a secure backend architecture, Firebase Authentication, and MongoDB persistence.

The application supports multiple AI providers, enforces per-model daily usage limits, and maintains a backend-controlled system prompt architecture.

---

## Overview

EimemesChat AI is designed as a modular, SaaS-ready conversational AI system that:

- Supports multiple LLM providers
- Enforces usage governance per model
- Implements secure authentication via Firebase
- Stores conversation history per user
- Maintains strict backend-only system configuration
- Provides role-based administrative controls

The architecture separates authentication, AI routing, usage enforcement, and presentation logic into clearly defined layers.

---

## Architecture

### Frontend
- React (or Next.js)
- Tailwind CSS
- Firebase Client SDK
- Axios
- Markdown + Syntax Highlighting

### Backend
- Node.js
- Express
- MongoDB Atlas
- Firebase Admin SDK
- OpenAI SDK
- Gemini API
- Llama API provider
- Helmet
- CORS
- Rate limiting middleware

### Infrastructure
- GitHub (source control)
- Vercel (frontend hosting)
- Render (backend hosting)
- MongoDB Atlas (database)

---

## Core Capabilities

### Multi-Model Support

The system supports dynamic routing between:

- ChatGPT (OpenAI)
- Meta Llama (via external provider)
- Gemini (Google AI)

Each conversation is associated with a specific model.

---

### Usage Limiting

Daily per-user message limits are enforced server-side:

| Model        | Daily Limit |
|-------------|------------|
| ChatGPT     | 50        |
| Meta Llama  | 40        |
| Gemini      | 60        |

Usage counters:
- Persist in the database
- Automatically reset every 24 hours
- Are validated before each AI request
- Cannot be bypassed from frontend

---

### Authentication & Authorization

Authentication is handled by Firebase.

Backend responsibilities:
- Verify Firebase ID tokens
- Create user record if not present
- Enforce role-based access control

Roles:
- `user`
- `admin`

Admin-only routes are validated strictly on the backend.

---

### AI Processing Flow

1. User sends message from frontend.
2. Firebase ID token is included in request.
3. Backend verifies token.
4. Backend checks daily usage limit.
5. Conversation history is loaded.
6. Hidden system prompt is attached.
7. Request is routed to selected AI provider.
8. Response is stored in MongoDB.
9. Response is returned to frontend (streaming supported).

---

### Hidden System Prompt

The system prompt:

- Is stored exclusively on the backend.
- Is never exposed in frontend code.
- Applies automatically to all AI requests.
- Can be modified via admin dashboard.

This prevents prompt manipulation or inspection from client-side.

---

## Data Models

### User

- firebaseUID
- email
- username
- role
- usage[] (per-model daily tracking)
- createdAt

### Conversation

- userId
- title
- modelUsed
- messages[]
- createdAt
- updatedAt

---

## Security Considerations

- Firebase Admin token verification
- Role validation middleware
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation
- Environment variable isolation
- API keys never exposed to frontend
- Backend-only system prompt storage

Frontend is treated as untrusted environment.

---

## Project Structure

```
/client
/server
```

Server contains:
- routes
- controllers
- models
- middleware
- services

Client contains:
- components
- pages
- context
- hooks
- services
- utils

---

## Environment Variables

### Backend

```
MONGO_URI=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
LLAMA_API_KEY=
PORT=
```

### Frontend

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_API_URL=
```

---

## Deployment

Frontend:
- Deploy via Vercel.
- Set root directory to `/client`.
- Configure environment variables.

Backend:
- Deploy via Render.
- Set root directory to `/server`.
- Configure environment variables.

Database:
- MongoDB Atlas cluster.
- Whitelist deployment IPs.

---

## Design Principles

- Backend-enforced security
- Clear separation of concerns
- Model-agnostic routing layer
- Extensible provider architecture
- SaaS-ready governance controls
- No sensitive logic in frontend

---

## License


---

## Maintainer

Author 
Michael Kilong

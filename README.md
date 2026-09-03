# loveable-cloud-ide
An enterprise-grade, microservice-powered cloud IDE and autonomous AI coding platform. Features React 19, LangGraph &amp; Mistral AI agents, Monaco Editor, live preview runtimes, and AWS EKS Kubernetes pod orchestration.

# ⚡ Loveable — Autonomous AI Web Application Platform

Loveable is an enterprise-grade, microservice-driven cloud IDE and autonomous AI coding engine (inspired by Bolt.new & Loveable.dev). It allows developers to prompt an AI agent to write multi-file code, manipulate workspace files, and immediately preview running Next.js/React applications in real-time inside the browser.

### 🚀 Key Microservices:
- ⚛️ **Frontend (`:5173`)**: React 19, Vite, TailwindCSS v4, Monaco Editor & React Arborist.
- 🔐 **Auth Service (`:4000`)**: Express REST API, HttpOnly JWT token rotation, MongoDB & bcryptjs.
- 📁 **Project Service (`:3000`)**: Project CRUD, Kubernetes Pod lifecycle launcher, & idle reaper.
- 🤖 **AI Service (`:3001`)**: LangGraph & LangChain agent workflow powered by Mistral AI with SSE streaming.
- 📂 **File Server (`:8080`)**: Dedicated RESTful workspace filesystem management API.
- 🔄 **Sync Service**: Two-way workspace file watcher uploading to AWS S3 storage buckets.


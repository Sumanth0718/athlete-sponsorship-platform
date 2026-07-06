# Athlete Sponsorship Management Platform

The **Athlete Sponsorship Management Platform** is a full-stack Next.js application designed to help professional athletes and their representatives manage brands, negotiate deals, analyze contracts via AI, and follow up on pending payments.

## Features

- **Dashboard Overview**: Real-time metrics overview of pipeline value, active sponsorships, total contracts, and partner brands.
- **Brand Management**: Centralized contact directory for sponsors and brand representatives.
- **Deals Pipeline**: A Kanban-style board to track sponsorships from `DRAFT` to `COMPLETED`.
- **Contract Vault**: Securely upload and store PDF/DOCX contracts powered by Cloudinary.
- **AI Contract Analyzer**: Extract key dates, clauses, and deliverables from legal documents automatically using OpenAI.
- **AI Follow-Up Generator**: Instantly draft professional, context-aware payment follow-up emails for pending deals, directly integrated with Gmail.
- **Secure Authentication**: Role-based access control and session persistence via Auth.js (NextAuth).

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, Shadcn UI
- **Backend**: Next.js Server Actions & Route Handlers
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Authentication**: Auth.js v5 (Credentials Provider)
- **AI Integration**: OpenAI (`gpt-4o-mini`)
- **Storage**: Cloudinary

## Installation Guide

### Prerequisites
- Node.js 18+
- PostgreSQL Database (e.g., Neon or Supabase)
  
  

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brand-deals-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (see `.env` for the required template):
   ```env
   DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
   AUTH_SECRET="your_generated_secret"
   AUTH_URL="http://localhost:3000"
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   OPENAI_API_KEY="..."
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

## Screenshots

Here are some screenshots of the application in action:

### 1. Landing Page
![Landing Page](./public/screenshots/landing_page.png)

### 2. Dashboard Overview
![Dashboard Overview](./public/screenshots/dashboard_overview.png)

# Architecture Overview

The Athlete Sponsorship Management Platform relies on a modern, decoupled architecture powered by Next.js 15, taking full advantage of the App Router, React Server Components (RSC), and Server Actions.

## Frontend Architecture

- **App Router (`src/app`)**: Pages are heavily server-rendered for maximum SEO and minimal client payload. Interactive elements (like forms, Modals, Recharts) are isolated into "use client" components within `src/components` or co-located route directories.
- **Styling**: Tailwind CSS combined with `shadcn/ui` for accessible, rapidly-developed design system components.
- **Data Visualizations**: Recharts handles drawing canvas/SVG elements based on aggregation props mapped directly from the server.

## Backend Architecture

- **Server Actions & Route Handlers**: Business logic runs securely on the Node.js Edge or Lambda layer through Vercel. Database reads occur in asynchronous Server Components, whereas mutations utilize Next.js Server Actions.
- **Data Layer (`src/lib/db.ts`)**: Prisma ORM acts as the bridge to our PostgreSQL instance. All queries are typed automatically via the `@prisma/client`.
- **Service Abstractions (`src/lib/services.ts`)**: Abstracted database fetching logic to separate concerns from UI, ensuring that if the database fails, the platform can gracefully fallback to mock implementations.

## Authentication Flow

1. **Auth.js (NextAuth v5)**: Operates at the edge (`middleware.ts`) to intercept unauthorized requests before they hit the dashboard.
2. **Session Context**: Once logged in, the `userId` is bound to the `session` and is aggressively used in every database query to ensure multi-tenant security isolation.

## AI Contract Analysis Flow

1. **Upload**: User uploads a PDF/DOCX to Cloudinary.
2. **Parsing**: A backend route `POST /api/contracts/[id]/analyze` securely downloads the file and parses the text using `pdf-parse` or `mammoth`.
3. **OpenAI Extraction**: The extracted text is injected into a specialized `gpt-4o-mini` prompt.
4. **JSON Structuring**: OpenAI returns a strict JSON payload extracting deliverables, dates, and terms, which is then persisted to the `ContractAnalysis` model.

## Follow-Up Generation Flow

1. **Context Aggregation**: The Deal board identifies a deal with a `pendingAmount > 0`.
2. **Trigger**: User clicks the "Sparkles" button, firing a request to `POST /api/deals/[id]/follow-up`.
3. **Generation**: The backend sends the deal's exact financial context to OpenAI.
4. **Delivery**: The resulting generated Subject and Body are persisted in the `FollowUp` table and displayed in a client Modal for 1-click Gmail execution.

## Cloudinary Integration Flow

1. **File Drop**: Users drag-and-drop a file.
2. **Form Data**: The file is appended to a `FormData` object and sent to a `POST /api/contracts` endpoint.
3. **Cloudinary Upload**: The backend uses the `cloudinary` Node SDK to stream the buffer directly to Cloudinary.
4. **URL Persistence**: The resulting `cloudinaryUrl` and `cloudinaryPublicId` are saved to the PostgreSQL `Contract` table to serve as a permanent digital vault.

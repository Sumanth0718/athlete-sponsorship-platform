# API Documentation

The platform utilizes Next.js App Router Route Handlers (`src/app/api/...`) and secure Server Actions. Below is an outline of the primary API surfaces.

> All endpoints are protected. Requests missing a valid NextAuth session cookie will return `401 Unauthorized`. Requests targeting resources owned by a different `userId` will return `403 Forbidden`.

## Authentication APIs
Controlled by Auth.js (`next-auth`).
- **`POST /api/auth/callback/credentials`**: Handles login verifications.
- **`POST /api/auth/signout`**: Destroys the secure session cookie.

## Deals APIs
- **`Server Action: updateDealStatusAction(dealId, status)`**: Transitions a deal (e.g., from `NEGOTIATING` to `ACTIVE`).

## AI Follow-Up APIs
- **`POST /api/deals/[id]/follow-up`**:
  - **Purpose**: Generates an email to collect pending payments for a specific deal.
  - **Logic**: Aggregates the deal's `pendingAmount` and `brandName`, sends the payload to OpenAI, and persists the generated string into the `FollowUp` table.
  - **Response**: `{ success: true, followUp: { subject, body } }`

## Contracts APIs
- **`POST /api/contracts`**:
  - **Purpose**: Uploads a document to Cloudinary and saves the metadata.
  - **Payload**: `FormData` containing the file buffer and associated `brandId`.
  - **Response**: `{ success: true, contract: { id, cloudinaryUrl } }`

- **`DELETE /api/contracts/[id]`**:
  - **Purpose**: Deletes a contract from PostgreSQL and executes a destructive API call to Cloudinary using the `cloudinaryPublicId` to remove the file from the cloud bucket.
  - **Response**: `{ success: true }`

## AI Analysis APIs
- **`POST /api/contracts/[id]/analyze`**:
  - **Purpose**: Downloads the file from Cloudinary, parses it using `pdf-parse` or `mammoth`, and streams the raw text to OpenAI to generate a structured JSON overview.
  - **Response**: `{ success: true, analysis: { deliverables, paymentTerms, ... } }`

# Clinic Digital Growth — SaaS Platform

## Overview

A multi-tenant SaaS platform for Indian clinics. Doctors can manage appointments, token queues, subscriptions, and analytics. Patients can book appointments online. Super-admins manage all clinics from a central panel.

## Architecture

pnpm workspace monorepo with TypeScript throughout:

| Package | Purpose |
|---|---|
| `artifacts/clinic-saas` | React + Vite frontend (Wouter v3 routing, Tailwind, shadcn/ui) |
| `artifacts/api-server` | Express 5 REST API (JWT auth, Drizzle ORM, Fastify-logger via pino) |
| `lib/api-spec` | OpenAPI 3.1 spec (source of truth for all API shapes) |
| `lib/api-client-react` | Orval-generated React Query hooks + Zod schemas |
| `lib/api-zod` | Generated Zod schemas only |
| `lib/db` | Drizzle schema + PostgreSQL client |

## Stack

- **Node.js**: 24 / **TypeScript**: 5.9 / **pnpm** workspaces
- **Frontend**: React 19, Vite 7, Wouter v3, Tailwind v4, shadcn/ui
- **Backend**: Express 5, Pino logging, JWT (HS256), Drizzle ORM
- **Database**: PostgreSQL 16 (Helium / Neon)
- **API layer**: OpenAPI 3.1 → Orval codegen → React Query hooks
- **Payments**: Razorpay (server-side order creation + webhook)

## Key Commands

```bash
pnpm run typecheck                              # Full workspace typecheck
pnpm run build                                  # Build all packages
pnpm --filter @workspace/api-spec run codegen   # Regen API hooks from spec
pnpm --filter @workspace/db run push            # Sync DB schema (dev only)
pnpm --filter @workspace/db run seed            # Seed demo data
pnpm --filter @workspace/api-server run dev     # Run API server
pnpm --filter @workspace/clinic-saas run dev    # Run frontend
```

## Routing (Wouter v3 with `nest`)

The frontend uses Wouter v3 with the `nest` prop for sub-sections:

```tsx
<Route path="/dashboard" nest>   // doctor dashboard
<Route path="/admin" nest>       // super-admin panel
```

**Critical**: Sidebar links inside nested routes MUST use relative hrefs (`/appointments`, not `/dashboard/appointments`). The `ProtectedRoute` component uses `window.location.replace()` for redirects to bypass nested router context.

## Auth Flow

- JWT stored in `localStorage` as `cdg_token`
- `setAuthTokenGetter(() => localStorage.getItem("cdg_token"))` called at module init in `auth.tsx`
- All protected API calls attach `Authorization: Bearer <token>` via custom fetch
- Roles: `super_admin`, `doctor`, `patient`

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@clinicgrowth.in` | `admin123` |
| Doctor | `doctor@apollo.in` | `doctor123` |

## Pages

| Path | Component | Auth |
|---|---|---|
| `/` | Landing page (pricing, FAQ, testimonials, contact form, Google Maps) | Public |
| `/book` | 3-step patient booking form | Public |
| `/book/success` | Booking confirmation + token number + QR code for entry scan | Public |
| `/login` | Doctor/Admin login | Public |
| `/register` | Clinic registration | Public |
| `/dashboard` | Doctor overview (token queue, stats) | doctor |
| `/dashboard/appointments` | Appointment list + filter | doctor |
| `/dashboard/analytics` | Charts + patient stats | doctor |
| `/dashboard/recharge` | Subscription plans + recharge | doctor |
| `/dashboard/settings` | Clinic settings | doctor |
| `/admin` | Admin overview | super_admin |
| `/admin/clinics` | Clinic directory | super_admin |
| `/admin/clinics/:id` | Clinic detail | super_admin |

## API Routes (all under `/api`)

- `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- `GET /clinics` (public), `POST /clinics`, `PATCH /clinics/:id`
- `GET /doctors`, `POST /doctors`
- `GET /appointments`, `POST /appointments/book`, `PATCH /appointments/:id`
- `GET /tokens`, `PATCH /tokens/:id/advance`
- `GET /subscriptions`, `POST /subscriptions`
- `POST /payments/create-order`, `POST /payments/verify`
- `GET /dashboard/stats`, `GET /dashboard/weekly-stats`, `GET /dashboard/patient-stats`
- `GET /admin/stats`, `GET /admin/clinics`
- `GET /invoices`

## Environment Variables

| Key | Required | Notes |
|---|---|---|
| `JWT_SECRET` | Yes | Random hex string; set as shared env var |
| `RAZORPAY_KEY_ID` | Yes (for payments) | From Razorpay dashboard |
| `RAZORPAY_SECRET` | Yes (for payments) | From Razorpay dashboard |
| `DATABASE_URL` | Auto | Managed by Replit Helium DB |
| `PORT` | Auto | Per-artifact port assigned by Replit |
| `BASE_PATH` | Auto | Vite base path (e.g., `/`) |

## API Client Usage

```typescript
import { useListAppointments, useBookAppointment, setAuthTokenGetter } from "@workspace/api-client-react";

// Hooks return T directly (not { data: T })
const { data: appointments } = useListAppointments({ date: "2026-04-03" });

// Mutations: pass data inside { data: body }
bookMutation.mutate({ data: { clinicId: 1, patientName: "..." } });
```

**Never** import from sub-paths (`/src/custom-fetch`, `/src/generated`). Always import from the package root.

## Pricing Packages (landing page)

| Package | Price | Type |
|---|---|---|
| Smart Booking | ₹7,999 | One-time |
| Standalone Website | ₹12,999 | One-time |
| Digital Growth | ₹18,999 | One-time (featured) |

SaaS subscriptions (monthly ₹999, quarterly ₹2,499, yearly ₹9,999) are managed via the Recharge dashboard page.

## Subscription Expiry Overlay

When a doctor's subscription is inactive (`isActive: false` from `GET /api/subscriptions/current`), a full-page overlay is shown in the dashboard locking all pages except `/recharge`. It prompts the doctor to recharge. A yellow warning banner also appears in the sidebar when `daysRemaining <= 7`.

## QR Code Booking Entry

On the booking success page, a QR code (rendered via `qrcode.react`) encodes appointment ID, token number, patient name, and date. Clinic staff can scan this code at entry to instantly verify the appointment.

## Landing Page Extras

- Scroll animations via `IntersectionObserver` (CSS `reveal`/`animate-in` classes)
- Contact form (client-side only, shows success toast on submit)
- Google Maps embed (iframe) showing Mumbai office location

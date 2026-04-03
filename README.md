# CollabSpace

**CollabSpace** is a SaaS-based workplace booking system designed for organizations to manage seats, meeting rooms, and shared workspace usage efficiently. It allows companies to onboard their teams, manage office resources, and enable employees to book seats or rooms with real-time updates.

---

## What This Project Solves

Most workplaces struggle with:
* Unused or double-booked seats
* No visibility into room availability
* No tracking of actual usage (no-shows, etc.)

**CollabSpace addresses this by providing:**
* **Centralized booking system:** One source of truth for all resources.
* **Real-time availability updates:** No more walking to a "free" room only to find it occupied.
* **Usage tracking and enforcement:** Integrated check-in and no-show logic.

---

## Tech Stack

### Backend
* **Node.js** & **Express**
* **MongoDB** (Mongoose)
* **JWT** (Authentication)
* **Socket.IO** (Real-time updates)

### Frontend
* **React** (Vite)
* **Axios**
* **Socket.IO client**

---

## Architecture

The backend follows a **layered monolith structure**:
`Routes → Controllers → Services → Models → Database`

**Key principles:**
* Business logic lives in **services**.
* Controllers stay **thin**.
* Middleware handles **auth and errors**.
* Stateless **JWT authentication**.

---

## Multi-Tenant Design (SaaS)

This is a **multi-tenant system**. Each organization is isolated using a unique `organizationId`.

**All core entities are scoped to an organization:**
* Users, Seats, Rooms, and Bookings.

**Every request is filtered using:**
`req.user.organizationId`

This ensures strict data isolation between companies.

---

## Roles & Models

### Roles
* **SUPER_ADMIN:** Platform owner (creates organizations).
* **ADMIN:** Manages organization-specific data (users, seats, rooms).
* **USER:** Books seats and rooms.

### Core Models
* **Organization:** Represents a company using the platform.
* **User:** Name, email, hashed password, role, `organizationId`.
* **Seat:** Code (e.g., A1, F2-12), floor, status (AVAILABLE / MAINTENANCE / CLOSED), position (for floor maps).
* **Room:** Name, capacity, floor, amenities, status.
* **SeatBooking:** User, seat, time slots, status (BOOKED, NO_SHOW, etc.), `checkedInAt`.
* **RoomBooking:** Host, room, participants, time slots, status, `checkedInAt`.

---

## Features Implemented

### Authentication & Authorization
* JWT-based login and password hashing.
* Role-based access control (RBAC).
* **SUPER_ADMIN** controlled onboarding (no public signup).

### Management & Booking
* **Organization Management:** Created by Super Admin with an initial Admin user.
* **Seat Booking:** Conflict prevention (no overlaps), check-in support, and auto no-show handling via cron jobs.
* **Room Booking:** Multi-user participants, capacity validation, and host/participant check-in.

### Real-Time & Background Tasks
* **Socket.IO:** `seatBooked` and `seatReleased` events scoped per organization.
* **Cron Jobs:** Automatically marks bookings as `NO_SHOW` to free up resources.

### APIs & Frontend
* Full suite of booking, availability, and admin APIs.
* Pagination and filtering for resource listings.
* **Frontend (Partial):** React setup, API integration, and real-time seat listing.

---

## Project Status

| Component | Status | Notes |
| :--- | :--- | :--- |
| **Backend** | ✅ Fully Functional | Multi-tenant safe, real-time enabled. |
| **Frontend** | 🟡 Basic UI Done | Core booking flows are still pending. |

---

## Remaining Work

### High Priority
* Frontend authentication (login + token handling) and protected routes.
* Complete Seat and Room booking UI.
* Admin Dashboards.

### Medium Priority
* Search & filtering UI.
* User dashboard ("My Bookings").
* Admin resource management and input validation.

### Advanced Features (Planned)
* Floor map visualization.
* Analytics dashboard and smart recommendations.
* Waitlist system and calendar integration (Email/In-app).

---

## Key Design Decisions
1.  **Single Database:** Used organization-based isolation for simplicity and cost-efficiency.
2.  **Private Onboarding:** No public signup to maintain platform integrity.
3.  **Instant Booking:** No approval system to ensure better UX.
4.  **Service Layer Logic:** Kept all complex booking logic out of models for better testability.

---

## How to Run

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```
# Property Review Management System

A Next.js 14 + TypeScript web application for managing and visualizing property reviews.

It integrates with the Hostaway API, providing both public-facing property pages and a manager dashboard with review analytics, approval controls, and trend visualization.

---

## Features

### Public Interface
- Displays each property with a photo gallery and detailed description.
- Lists approved guest reviews and average ratings by category.
- Shows dynamic photo galleries using picsum.photos placeholder images.

### Admin Dashboard
- Secure admin view for reviewing and approving guest reviews (username: admin, password: admin).
- KPI cards for average rating, approval rate, and total reviews.
- Interactive monthly rating trend chart using Recharts.
- Property-level statistics and category averages.
- Integrated caching and offline mock data fallback.

### API Integration
- Connected to the Hostaway API for real review data.
- Falls back to local mock JSON data if the API is unavailable.
- Implements access token caching and 5-minute review caching.

---

## Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Lucide React Icons |
| Charts | Recharts |
| Backend / API | Next.js API Routes |
| Data Source | Hostaway API + Local mock data |
| Utilities | In-memory caching, JSON normalization |
| Deployment | Vercel |

---

## Setup & Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/property-review-management.git
   cd property-review-management
   ```
Install dependencies:

```
npm install
```
Create a .env.local file in the root directory and add:

```
HOSTAWAY_CLIENT_ID=your_client_id
HOSTAWAY_CLIENT_SECRET=your_client_secret
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1
```

Run the development server:

```
npm run dev
```
Then open http://localhost:3000

API Endpoints
GET /api/reviews/hostaway
Fetches property reviews from Hostaway or mock data.

Response example:

```
{
  "success": true,
  "source": "hostaway | cache | mock",
  "data": [...]
}
```

Caches results for 5 minutes.

POST /api/reviews/hostaway
Updates approval status of reviews.

Example:

```
[
  { "id": 123, "approved": true }
]
```
Stores approval states in-memory.

Automatically invalidates cached data.

Key Design and Logic Decisions
Componentization: Logic split into reusable UI components for clarity and scalability.

Normalization: All Hostaway API data converted into a consistent internal structure.

Caching Layer: Reduces redundant API calls and speeds up load times.

Fallback Handling: If the Hostaway API fails, the app automatically uses mock JSON data.

Type Safety: Strong TypeScript interfaces ensure reliability and maintainability.

Future Improvements
Persistent database for review approvals (e.g., PostgreSQL or Firebase).

Role-based authentication for admin users.

Integration with Google Reviews API for cross-platform insights.

Author
Emirhan Ataman

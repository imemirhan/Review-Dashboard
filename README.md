Property Review Management System

A Next.js 14 + TypeScript web application for managing and visualizing property reviews.
It integrates with the Hostaway API, provides both public-facing property pages and a manager dashboard with review analytics, approval controls, and trend visualization.

Features
🔹 Public Interface

Displays each property with photo gallery and detailed description.

Lists approved guest reviews and average ratings by category.

Shows dynamic photo galleries using picsum.photos placeholder images.

🔹 Admin Dashboard

Secure admin view for reviewing and approving guest reviews. (username: admin, password: admin)

KPI cards (average rating, approval rate, total reviews).

Interactive monthly rating trend chart using Recharts.

Property-level statistics and category averages.

Integrated caching and offline mock data fallback.

🔹 API Integration

Connected to Hostaway API for real review data.

Falls back to local mock JSON data if the API is unavailable.

Implements access token caching and 5-minute review caching.

🧠 Tech Stack
Category	Technology
Frontend	Next.js 14 (App Router), React 18, TypeScript
Styling	Tailwind CSS, Lucide React Icons
Charts	Recharts
Backend / API	Next.js API Routes
Data Source	Hostaway API + Local mock data
Utilities	In-memory caching, JSON normalization
Deployment Ready	Vercel
🗂️ Project Structure
src/
├── app/
│   ├── api/
│   │   └── reviews/
│   │       └── hostaway/route.ts       # API integration & caching
│   ├── dashboard/                      # Manager dashboard
|   |   ├──property/
|   |   └──reviews/
│   ├── property/[id]/page.tsx          # Public property details page
|   └── login/                          # Dashboard login
├── components/
│   ├── PropertyCard.tsx                # Reusable property display
│   ├── ReviewCard.tsx                  # Guest review card
│   ├── ManagerReviewCard.tsx           # Manager review control
│   ├── RatingTrend.tsx                 # Line chart for analytics
│   ├── StatCard.tsx                    # KPI cards
│   └── PublicLayout.tsx                # Shared layout for public pages
├── lib/
│   ├── constants.ts                    # Global constants (e.g., image URL)
│   ├── utils.ts                        # Helper functions
│   └── types.ts                        # Shared TypeScript interfaces
└── data/
    └── mockReviews.json                # Fallback mock data

Download project -> go to the root of the project

'''
npm install
'''

Create a .env.local file at the root and add your credentials:

HOSTAWAY_CLIENT_ID=your_client_id
HOSTAWAY_CLIENT_SECRET=your_client_secret
HOSTAWAY_BASE_URL=https://api.hostaway.com/v1

then
'''
npm run dev
'''

then you can open http://localhost:3000

🌐 API Endpoints
GET /api/reviews/hostaway

Fetches property reviews from Hostaway or mock data.

Returns { success, source, data }

Caches results for 5 minutes

POST /api/reviews/hostaway

Updates approval status of reviews.

[
  { "id": 123, "approved": true }
]


In-memory persistence

Automatically invalidates cache

Key Design Decisions

Componentization: Separated logic into smaller, reusable UI blocks.

Normalization: All external API data converted into a unified structure.

Caching Layer: Reduces redundant API requests and improves response speed.

Fallback Handling: App gracefully switches to local data if hostaway api fails.

Type Safety: Enforced across components and API using TypeScript interfaces.

🧩 Future Improvements

Persistent storage for review approvals (e.g., PostgreSQL or Firebase).

Role-based authentication for admins.

Integration with Google Reviews API for cross-platform insights.

🧑‍💻 Author
Emirhan Ataman
# GreenNow

> **A community platform for reporting pollution, organizing cleanups, and advocating for lasting environmental change.**

[![Live application](https://img.shields.io/badge/Live%20app-GreenNow-2f855a?style=flat-square)](https://green-now-self.vercel.app/welcome)
[![License](https://img.shields.io/badge/License-Apache--2.0-3f51b5?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-087ea4?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

**GreenNow** helps communities turn local environmental concerns into visible, coordinated action. People can report polluted locations, adopt or organize cleanup events, invite volunteers, record results, share progress, and support policy campaigns. The public landing page describes this progression as **Report**, **Organize**, and **Advocate**. [1]

The deployed experience is available at [green-now-self.vercel.app](https://green-now-self.vercel.app/welcome), and the project source is maintained in this repository. [1] [2]

## Contents

- [Why GreenNow](#why-greennow)
- [What it does](#what-it-does)
- [User journey](#user-journey)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Backend requirements](#backend-requirements)
- [Available commands](#available-commands)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Why GreenNow

Pollution is local, but resolving it requires more than a single cleanup day. GreenNow is designed to connect people who identify a problem with people who can organize and attend a response. It then preserves event updates and impact information so the community can recognize progress and support advocacy aimed at preventing recurring waste problems. [1]

| Pillar | Community outcome |
|---|---|
| **Report** | Make a polluted site visible with a location, details, urgency, and optional photo. |
| **Organize** | Turn a site report into a cleanup, or publish a new cleanup directly. |
| **Participate** | Let volunteers discover events, RSVP, post updates, and record cleanup outcomes. |
| **Advocate** | Build support for campaigns that address the policies and practices behind pollution. |

## What it does

GreenNow is a protected, account-based web application. Visitors can learn about the mission and create an account; signed-in members receive access to the community workspace.

| Area | Implemented capabilities |
|---|---|
| **Authentication and onboarding** | Email/password signup, sign-in, password reset, session-aware routing, and a first-use onboarding flow. |
| **Pollution reporting** | Location/address lookup, a clickable map pin, site type and urgency selection, problem description, and optional photo upload. |
| **Cleanup events** | Create cleanup events, adopt unclaimed reports, add a schedule and volunteer target, link an event to a group, RSVP, post updates, and mark results after cleanup. |
| **Discovery** | Bulletin of cleanup activity, interactive map with an unclaimed-report filter, event detail pages, and an impact gallery of completed cleanups. |
| **Community** | Local/cause-based groups, a social feed with photos, likes, comments, event/group links, notifications, member profiles, badges, and an opt-in impact leaderboard. |
| **Advocacy** | Create campaigns, collect signatures and optional comments, share campaign links, find U.S. representatives by state, and compose a representative-contact message in context. |
| **Trust and administration** | Content flagging, rate limiting on selected actions, organization-verification requests, and an administrator moderation queue. |
| **Impact** | Personal cleanup and trash-removed statistics, gallery highlights, and an analytics view for aggregate activity. |

## User journey

The core flow can begin with a report or a planned cleanup. This design means a community member can make an issue discoverable without taking responsibility for organizing the full event.

1. **Report or post.** A signed-in user either reports a polluted location or posts a complete cleanup event.
2. **Adopt and schedule.** An organizer can adopt an unclaimed report and provide the logistical details needed for volunteers.
3. **Join and update.** Members discover events in the bulletin or map, RSVP, participate, and add progress updates.
4. **Document impact.** Organizers can record cleanup status, collected trash weight, and after photos; completed cleanups become eligible for the gallery.
5. **Push for prevention.** Members can create or sign campaigns and use the representative lookup to connect advocacy with a public-policy target.

> GreenNow’s public mission is to build collective capacity for local cleanup while advocating for reforms that reduce dumping and corporate waste at the source. [1]

## Technology

The frontend is a single-page React application built with Vite. It uses Supabase for authentication, data access, and media storage; React Router for client-side routing; and Leaflet with OpenStreetMap tiles for mapping. The application uses Nominatim for address-to-coordinate lookup and reads the public `congress-legislators` dataset for its U.S. representative lookup. [3] [4] [5] [6] [7] [8] [9]

| Layer | Technology | Purpose |
|---|---|---|
| UI | React 19 | Component-based user interface. |
| Build tooling | Vite 8 | Local development server and production bundling. |
| Routing | React Router 7 | Public, authentication, and protected application routes. |
| Backend | Supabase JavaScript client | Authentication, PostgreSQL-backed data access, and object storage. |
| Maps | Leaflet and OpenStreetMap | Map selection, event discovery, and map tiles. |
| Geocoding | Nominatim | Converts a typed address into a map location. |
| Representative data | `congress-legislators` | Provides the current-legislator data read by the representative lookup. |
| Hosting | Vercel | Hosts the production application. |

## Getting started

### Prerequisites

Install a current Node.js LTS release and npm. You will also need a Supabase project with the authentication, database, and Storage resources described in [Backend requirements](#backend-requirements). Vite’s current documentation specifies Node.js version requirements for its releases; confirm that your local Node version supports the version locked in `package.json`. [3]

### 1. Clone and install

```bash
git clone https://github.com/cvangavati/GreenNow.git
cd GreenNow
npm install
```

### 2. Create local environment variables

Create a file named `.env` in the repository root. Do not commit it.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

The application reads these two Vite-exposed variables when creating the Supabase client. The browser should only receive the Supabase URL and an **anon/publishable** key. Never expose a `service_role` key in a `VITE_` variable or any other client-side file. [4]

### 3. Configure Supabase

Enable email/password authentication and configure the authentication redirect URLs required for local development and production. The application’s sign-up flow sends `name` as user metadata and expects a backend trigger or equivalent provisioning flow to create a matching `profiles` row.

Provision the database tables, row-level security policies, and Storage buckets described below. This repository currently contains the frontend implementation but **does not include a Supabase schema migration or policy definition**, so a compatible backend must be supplied before all product features can work locally.

### 4. Start the application

```bash
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

### 5. Verify a production build

```bash
npm run build
npm run preview
```

## Backend requirements

GreenNow accesses Supabase directly from the browser. Secure your project with Row Level Security (RLS), narrowly scoped policies, and validation appropriate to your environment. The table and bucket names below are used by the client and must remain aligned with the application code.

| Resource type | Names used by the application | Purpose |
|---|---|---|
| Core tables | `profiles`, `events`, `rsvps`, `event_updates` | Profiles, cleanup records, participation, and progress history. |
| Community tables | `groups`, `group_members`, `posts`, `post_likes`, `post_comments`, `notifications` | Local groups, the community feed, engagement, and notifications. |
| Advocacy tables | `campaigns`, `campaign_signatures` | Policy campaigns and member signatures. |
| Trust tables | `flags`, `verification_requests` | Content reports, moderator decisions, and organization-verification submissions. |
| Storage buckets | `event-photos`, `post-photos` | Event/report and community-post image uploads. |

A compatible schema must support the fields used by the client, including event geographic coordinates and status, participant/user IDs, event photos, campaign metadata, and profile/admin/verification state. Configure database and storage policies so authenticated users can only create, modify, or view records and media appropriate to their role. In particular, give administration privileges through controlled profile/claim checks rather than relying on the browser UI alone. Supabase’s documentation explains using RLS to enforce browser-accessible data permissions. [4]

## Available commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds an optimized production bundle. |
| `npm run preview` | Serves the production build locally for verification. |
| `npm run lint` | Runs ESLint across the project. |

## Project structure

```text
GreenNow/
├── public/                 # Favicons, app icons, and web manifest
├── src/
│   ├── components/         # Navigation, onboarding, notifications, flags, and route guards
│   ├── context/            # Authentication context and session lifecycle
│   ├── hooks/              # Reusable client-side hooks, including rate limiting
│   ├── pages/              # Public, protected, event, group, campaign, map, and admin views
│   ├── services/           # Supabase client initialization
│   ├── App.jsx             # Application layout and route definitions
│   └── main.jsx            # React entry point
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json              # Hosting configuration
```

The application redirects unauthenticated visitors from the root route to `/welcome`. All community workspace, event, group, campaign, map, gallery, profile, moderation, and analytics routes are protected by the authentication layer.

## Deployment

The production app is deployed on Vercel. To publish your own instance, import the repository into Vercel or deploy with the Vercel CLI, then set the same two environment variables used locally:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

For reliable authentication flows, add your production URL and local development URL to Supabase Authentication’s redirect allow list. Confirm that Storage CORS and public/private bucket policies match the way your deployment serves photo URLs. Vercel’s Vite guide and Supabase Auth documentation provide the relevant platform configuration guidance. [10] [11]

## Contributing

Contributions are welcome. Please begin with a focused issue or discussion, then create a branch for your change. Before opening a pull request, run the project checks and describe any backend schema or policy assumptions introduced by the change.

```bash
npm run lint
npm run build
```

When contributing a feature that touches Supabase, include a migration, RLS policy changes, or a clear schema update in the same pull request. This keeps the frontend and backend contract reproducible for other developers.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

## References

[1]: https://green-now-self.vercel.app/welcome "GreenNow — Live Application"
[2]: https://github.com/cvangavati/GreenNow "cvangavati/GreenNow"
[3]: https://vite.dev/guide/ "Vite Documentation"
[4]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security Documentation"
[5]: https://react.dev/ "React Documentation"
[6]: https://leafletjs.com/ "Leaflet Documentation"
[7]: https://www.openstreetmap.org/copyright "OpenStreetMap Copyright and Tile Usage Information"
[8]: https://nominatim.org/release-docs/latest/api/Search/ "Nominatim Search API Documentation"
[9]: https://github.com/unitedstates/congress-legislators "UnitedStates Congress Legislators Dataset"
[10]: https://vercel.com/docs/frameworks/frontend/vite "Vercel Vite Deployment Documentation"
[11]: https://supabase.com/docs/guides/auth/redirect-urls "Supabase Auth Redirect URLs Documentation"

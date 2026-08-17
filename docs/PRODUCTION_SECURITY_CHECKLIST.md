# GreenNow Production Security Checklist

This checklist covers controls that cannot be enforced solely by the React repository. Complete and test each item in the relevant **Supabase** or **Vercel** project before public launch.

## Supabase

| Area | Required production action | Acceptance check |
|---|---|---|
| Environment variables | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for each environment. Never place a service-role key in a browser-delivered variable. | Inspect the built client and confirm no service-role key appears. |
| Row Level Security | Enable RLS on every table accessible through the browser: `profiles`, `events`, `rsvps`, `event_updates`, `groups`, `group_members`, `posts`, `post_likes`, `post_comments`, `notifications`, `campaigns`, `campaign_signatures`, `flags`, and `verification_requests`. | An unauthenticated request cannot read or alter protected records. |
| Ownership policies | Write policies that restrict insert, update, and delete actions to the appropriate user, event creator, group member, or administrator role. Do not use only client-side route guards as authorization. | A normal member cannot update another member’s profile, event, post, campaign, or verification request. |
| Field tampering | Use RLS, column privileges, database constraints, and/or controlled RPC functions to prevent users from setting privileged fields such as roles, banned state, verification state, ownership fields, or moderation decisions. | Modified browser requests cannot elevate role or change another record’s protected fields. |
| Storage buckets | Create and secure `event-photos` and `post-photos`. Restrict upload, read, update, and delete access by authenticated identity and permitted object path. Apply allowed MIME types and a maximum object size matching the app’s 5 MB client-side limit. | A user cannot upload an executable, exceed the configured size limit, or modify another user’s media object. |
| Authentication | Enable email/password authentication, configure the production redirect URL and local URL, review password requirements, and configure Supabase Auth rate limits appropriate to the expected traffic. | Signup, email confirmation, password reset, and reset redirect work only on approved URLs. |
| Bot and abuse protection | Enable a suitable CAPTCHA/Turnstile option for signup and sign-in if available for the project plan, and configure Auth rate limits. The repository’s honeypot and cooldown are supplementary only. | Automated repeated signup, login, and reset attempts are throttled before reaching normal application use. |
| Feedback collection | Run `docs/SUPABASE_FEEDBACK_SETUP.sql`, then test anonymous submission, normal-user isolation, and administrator review. Configure platform-level rate limits or CAPTCHA before broadly promoting the public form. | Public visitors can submit only bounded feedback; only administrators can access, update, or close feedback records. |
| Data minimization | Review profile, verification-request, location, media, and feedback retention needs. Restrict access to exact location, organization-verification data, and optional feedback contact details where community visibility is not required. | Production policies match the intended visibility of each field. |

## Vercel

| Area | Required production action | Acceptance check |
|---|---|---|
| Security headers | The repository adds CSP, frame protection, `nosniff`, HSTS, referrer policy, permissions policy, and cross-origin policies in `vercel.json`. Deploy and test the live headers after every material change. | A `curl -I` request shows the expected headers, and maps, Supabase, photo loading, and representative lookup still work. |
| HTTPS | Keep Vercel’s HTTPS redirect and HSTS active on the production domain. | HTTP redirects to HTTPS. |
| Environment separation | Use distinct Supabase projects or credentials for preview and production as appropriate. Do not expose production data to untrusted preview deployments. | Preview and production deployments show the intended backend environment. |
| WAF / rate controls | Enable available Vercel Firewall/WAF rate controls for public auth and high-volume routes when supported by the chosen plan. | Repeated abusive requests are blocked or challenged at the edge. |
| Analytics | Add a privacy-reviewed analytics integration only after choosing a provider, consent model, and measurement ID. No analytics identifier is stored in this repository. | Tracking is absent until intentionally configured and disclosed in the privacy policy. |

## Release checks

Before publishing a new release, run:

```bash
npm ci
npm run lint
npm run build
npm audit --omit=dev --audit-level=moderate
```

Use a separate, non-administrator test account to verify access controls. Test each Supabase policy directly with unauthenticated, ordinary-member, organizer, and administrator identities.

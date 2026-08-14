import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <article className="public-page policy-page" aria-labelledby="privacy-title">
      <p className="public-page__eyebrow">Effective August 14, 2026</p>
      <h1 id="privacy-title">GreenNow privacy policy</h1>
      <p className="public-page__lead">
        This policy explains the information GreenNow processes when you use the community reporting, cleanup, group, campaign, and profile features.
      </p>

      <section>
        <h2>Information you provide</h2>
        <p>
          GreenNow processes the information you submit when creating an account, editing a profile, reporting a site, creating or joining a cleanup, posting in the community feed, creating or signing a campaign, requesting organization verification, or contacting an elected representative through the app. Depending on the feature, this may include your name, email address, location, interests, event and post content, photo uploads, and campaign comments.
        </p>
      </section>

      <section>
        <h2>Location and cleanup information</h2>
        <p>
          Reports and cleanup events can include an address and map coordinates. GreenNow uses these details to place reports and events on maps, help people discover relevant cleanup activity, and display event details. Only share location information that is appropriate for a community-facing cleanup platform.
        </p>
      </section>

      <section>
        <h2>How GreenNow uses information</h2>
        <p>
          GreenNow uses submitted information to operate the features you select, including authentication, profiles, cleanup planning, RSVPs, progress updates, groups, community posts, notifications, campaigns, moderation, and impact summaries. The application also uses location lookup and map services to support mapping features.
        </p>
      </section>

      <section>
        <h2>Photos and community content</h2>
        <p>
          Photos and text you attach to reports, events, posts, or cleanup updates may be displayed within the related GreenNow feature. Do not upload content that you do not have permission to share, or content that reveals sensitive personal information about others.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          GreenNow uses Supabase for application authentication, data, and media-storage functionality. It uses OpenStreetMap tiles and Nominatim search to support maps and address lookup. The public deployment is hosted through Vercel. These providers process information as necessary to supply their services to GreenNow.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          GreenNow uses technical measures designed to protect the application. No internet service can guarantee absolute security. Use a unique password, keep your account credentials private, and report suspected misuse through the available reporting tools.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can update profile information within the application. For questions about account information, community content, or this policy, contact the GreenNow team through the project’s official support channel before relying on this policy for a specific legal purpose.
        </p>
      </section>

      <section>
        <h2>Policy updates</h2>
        <p>
          GreenNow may update this policy as the product changes. Material updates should include a revised effective date on this page.
        </p>
      </section>

      <p className="policy-page__notice">
        This policy is a working product draft based on the current application features. It should be reviewed by qualified legal counsel and supplemented with the GreenNow operator’s legal name, contact details, jurisdiction-specific disclosures, retention practices, and any applicable user-rights procedures before relying on it publicly.
      </p>

      <div className="hero-actions">
        <Link className="action-link action-link--secondary" to="/welcome">Back to welcome</Link>
      </div>
    </article>
  )
}

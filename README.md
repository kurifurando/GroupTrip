# Johor Bahru Field Notes

A lightweight Vercel-ready questionnaire for collecting friend availability, expectations, budget comfort, activity preferences, and carefully rationed shenanigan tolerance.

## What Happens On Submit

When someone clicks **Compose my trip readout**, the browser:

1. Builds a copyable summary for the friend.
2. Sends the raw answers to `/api/field-notes`.
3. The Vercel backend sanitises the answers, rebuilds the email body, and forwards it to the configured email service.

The real email endpoint URL, token, sender, and recipient are never placed in `index.html`.

## Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

```txt
EMAIL_ENDPOINT_URL=https://api.resend.com/emails
EMAIL_ENDPOINT_TOKEN=your_email_service_api_token
EMAIL_FROM=Johor Bahru Field Notes <trip@yourdomain.com>
EMAIL_TO=your@email.com
EMAIL_SUBJECT_PREFIX=JB trip questionnaire
```

Optional:

```txt
ALLOWED_ORIGIN=https://your-vercel-domain.vercel.app
EMAIL_ENDPOINT_AUTH_HEADER=Authorization
EMAIL_ENDPOINT_METHOD=POST
EMAIL_ENDPOINT_EXTRA_JSON={"tag":"jb-trip"}
```

For Resend, `EMAIL_ENDPOINT_URL=https://api.resend.com/emails` and `EMAIL_ENDPOINT_TOKEN` should be the Resend API key. Use a verified sender domain for `EMAIL_FROM` before sharing the form widely.

For other email services, keep the actual service URL/API key in Vercel env vars and adapt `EMAIL_ENDPOINT_EXTRA_JSON` if the provider needs extra JSON fields.

## Local Development

Use Vercel's dev server when testing submissions, because a plain static server will not run `/api/field-notes`:

```sh
npx vercel dev
```

The static page itself can be previewed with any local server, but email submission needs the Vercel function runtime.

## Privacy

The consent checkbox links to `privacy.html`, which is written for a small private Singapore trip-planning form and covers PDPA-style notice, purpose, consent, withdrawal, access/correction, retention, protection, overseas transfer, and contact expectations.

Before sending the questionnaire to friends, include your actual organiser contact in the message that shares the link so people know where to send privacy/access/correction requests.

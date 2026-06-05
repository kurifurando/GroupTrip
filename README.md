# Johor Bahru Field Notes

A lightweight, fully static questionnaire for collecting friend availability, expectations, budget comfort, activity preferences, and carefully rationed shenanigan tolerance. Responses are stored in a Google Sheet you own — like an anonymous Google Form, with no login required for the people filling it in.

## What Happens On Submit

When someone clicks **Compose my trip readout**, the browser:

1. Builds a copyable summary and computes a light "traveler profile".
2. Sends the answers straight to a Google Apps Script web app.
3. The script appends one row per response to your Google Sheet.

There is no backend server and no email step. The page is just static files (`index.html`, `privacy.html`) plus the Apps Script that lives in your Google account.

## Setup: connect the form to a Google Sheet

This is a one-time setup. Respondents never log in; you authorize the script once.

1. **Create the Sheet.** Make a new Google Sheet that will collect responses.
2. **Open Apps Script.** In that Sheet: **Extensions → Apps Script**.
3. **Paste the script.** Delete the placeholder code and paste in the contents of [`google-apps-script/Code.gs`](google-apps-script/Code.gs). Save.
4. **(Optional) Set a shared secret.** In the script, set `SHARED_SECRET` to a random string to stop strangers who find the URL from writing junk rows. You'll mirror this in step 7.
5. **Deploy as a Web app.** **Deploy → New deployment → gear icon → Web app**, with:
   - **Execute as:** Me (your Google account)
   - **Who has access:** Anyone  ← required so respondents need no login

   Click **Deploy**, grant the permissions it requests, then copy the **Web app** URL (it ends in `/exec`).
6. **Point the form at it.** Open [`index.html`](index.html) and set the config constants near the top of the `<script>` block:

   ```js
   const SHEET_ENDPOINT = "https://script.google.com/macros/s/XXXXX/exec";
   const SHEET_SECRET = ""; // must match SHARED_SECRET in the script (or leave both empty)
   ```
7. **Test.** Submit the form once and confirm a new row appears on the `Responses` tab. You can also open the `/exec` URL in a browser — it should return `{"ok":true,...}`.

> **Updating the script later:** after editing `Code.gs`, redeploy via **Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy**. The `/exec` URL stays the same.

## What gets stored

Each submission adds one row with: submission time, name, contact, computed profile, schedule windows, dates, duration, expectations, things to avoid, activities, wildcard, shenanigan/type-2 sliders, hard line, budget, travel instincts, needs, itinerary request, anything-else, and the source page URL. The header row is created automatically on first submit.

## Local Development

It's a static site, so any local server works:

```sh
npx serve .
# or
python -m http.server
```

Submissions go to the live Apps Script web app, so `SHEET_ENDPOINT` must be set for saving to work while testing.

## Deployment

Host the static files anywhere — GitHub Pages, Netlify, Cloudflare Pages, Vercel (as a static project), or any web server. There are no environment variables or serverless functions to configure.

## Privacy

The consent checkbox links to `privacy.html`, written for a small private Singapore trip-planning form. It covers PDPA-style notice, purpose, consent, withdrawal, access/correction, retention, protection, overseas transfer (the response Sheet lives on Google), and contact expectations.

Before sharing the link, include your actual organiser contact in the message so people know where to send privacy/access/correction requests. Keep the response Sheet private (do not share it publicly), and delete or anonymise responses once the trip is wrapped up.

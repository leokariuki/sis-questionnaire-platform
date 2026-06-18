# Google Sheets sync via Apps Script (no billing)

A billing-free way to auto-record every SIS submission into a Google Sheet.
No Google Cloud project and no service account required.

## How it works

```
Submission → SIS platform → POST → Apps Script Web App → appends row to the Sheet
```

The platform sends each response (token + tab name + headers + row) to an Apps
Script Web App bound to the Sheet. The script appends the row to the tab for that
questionnaire (e.g. `PRE_TEENS_13_17`), creating the tab and 73-column header on
first use.

## Setup (one time)

1. Open the target Sheet → **Extensions → Apps Script**.
2. Delete the default code, paste in `Code.gs` from this folder, **Save**.
3. Set `SHARED_TOKEN` (top of the script) to a long random secret.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy**, authorize when prompted, copy the **Web App URL**.
5. In the platform `.env.local` (and your host's env), set:
   ```
   SHEETS_WEBHOOK_URL=<the Web App URL>
   SHEETS_WEBHOOK_TOKEN=<the same SHARED_TOKEN>
   ```
6. Restart / redeploy the platform.

## Test

- Visit the Web App URL in a browser → should show `{"ok":true,...}`.
- Submit a test response → a row appears in the matching tab.

## Notes

- A `LockService` lock serializes concurrent submissions so rows never collide.
- Sync is best-effort: if the webhook is down, the submission still succeeds and
  the failure is logged (`[webhook] sync failed`).
- To change the columns, the platform's canonical schema lives in `src/lib/row.ts`.

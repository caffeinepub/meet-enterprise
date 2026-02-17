# Specification

## Summary
**Goal:** Replace the Internet Identity login experience with a simple Google + phone sign-in UI backed by frontend-only, session-based auth state.

**Planned changes:**
- Update `/account/login` to remove all Internet Identity UI/copy and stop using `useInternetIdentity()`, replacing it with (1) a “Continue with Google” button and (2) a phone number sign-in form with a clear primary action.
- Implement frontend-only session auth state (e.g., `sessionStorage`) for Google and phone sign-in that persists across refreshes for the browser session and routes users to `/profile` after sign-in.
- Keep (or replace with equivalent) “Continue as Guest” so users can proceed without authenticating.
- Update `/account` and any sign-in prompts to remove Internet Identity wording and align copy/flows with the new Google/phone options, including a sign-out action that clears session auth state.

**User-visible outcome:** Users can sign in via a Google button or phone number form (without real OAuth/SMS), continue as guest, remain signed in for the current browser session, and sign out to return to a signed-out state.

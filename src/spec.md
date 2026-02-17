# Specification

## Summary
**Goal:** Replace the existing Google/phone-style login UI on `/account/login` with a simulated email + 4-digit code verification flow, then collect required user details to complete sign-in.

**Planned changes:**
- Update ONLY the two specified DOM elements on `/account/login` to implement a multi-step sign-in: enter email → generate/display simulated 4-digit code → enter/verify code → collect name, address, phone to finish.
- Add inline validation and English error messaging within the selected elements for invalid/empty email, incorrect code, and missing/invalid name/address/phone; allow resend code (new code invalidates old) and allow retry/correction without leaving the page.
- On successful verification + details submission, sign the user in using the existing session-based mechanism, clear any guest session, refresh relevant cached queries, and redirect to the existing post-login destination (currently `/profile`).
- Replace the selected SVG icon with a non-Google, email/code verification-themed icon that renders correctly in light/dark themes.

**User-visible outcome:** On the login page, users can sign in by entering an email, viewing and entering an in-app 4-digit code, providing required details (name/address/phone), and then they are logged in and redirected to their profile, with clear errors and retry options when inputs are invalid.

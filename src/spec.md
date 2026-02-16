# Specification

## Summary
**Goal:** Remove remaining Internet Identity dependencies so username/password sign-up and in-app auth gating work without requiring `useInternetIdentity()` or any redirects to id.ai.

**Planned changes:**
- Update the username/password sign-up flow to not import/call `useInternetIdentity()`, not require `identity` to submit, and not show the “Please enable guest mode or sign in to continue” error during normal sign-up.
- Replace Internet Identity-based “authenticated” checks across account/auth UI with backend-derived session/role state so UI (Sign In/Logout) and route gating no longer depend on `useInternetIdentity()`.
- Update backend authorization so a guest caller can successfully set credentials and be treated as a `#user` after sign-up, enabling user-only actions (e.g., profile access) without Internet Identity.
- Ensure all auth-related routing/navigation stays in-app (e.g., `/account/signup`, guest mode) with no links or redirects to Internet Identity (id.ai).

**User-visible outcome:** Users can sign up with a username/password and reach their logged-in destination (e.g., `/profile`) without being blocked by Internet Identity; auth-gated pages and the account UI rely on in-app session/role state and never trigger external identity-provider redirects.

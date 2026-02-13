# Specification

## Summary
**Goal:** Ensure bottom-of-page content inside the main content area stays visible on small screens and is not covered by the fixed mobile bottom navigation.

**Planned changes:**
- Update the `<main>` element in `frontend/src/components/layout/AppShell.tsx` to add appropriate bottom spacing on mobile viewports so content rendered via `<Outlet />` can scroll above the fixed `MobileBottomNav`.
- Keep desktop (>= md) layout spacing and scrolling behavior unchanged.

**User-visible outcome:** On mobile, users can read and scroll to the very bottom of pages without the last lines being hidden behind the fixed bottom navigation; desktop behavior remains the same.

# Admin Activation Flow Documentation

## Overview
This document describes the admin activation flow for the Meet Enterprise e-commerce application, which uses a one-time 4-digit activation code system.

## Entry Point
- **Page**: `AdminActivatePage.tsx` (`/admin/activate`)
- **Hook**: `useAdminActivation.ts`
- **Backend Method**: `actor.bootstrapAdmin(BigInt(code))`

## Call Chain
1. User enters 4-digit code in `AdminActivatePage`
2. Form validation ensures code is exactly 4 digits
3. `useActor` hook checks backend actor availability
4. If actor unavailable, explicit error shown (no mutation attempted)
5. If actor ready, `useAdminActivation` mutation is invoked
6. Hook validates code format and converts to `BigInt`
7. Backend `bootstrapAdmin(activationCode: Nat)` is called
8. On success, role queries (`currentUserRole`, `isCallerAdmin`) are invalidated and refetched
9. User is redirected to `/admin` dashboard

## Backend Behavior
- **Default activation code**: `2537`
- **One-time use**: Once claimed, cannot be used again
- **Trap messages**:
  - `"Forbidden: Admin role has already been claimed"` - activation already used
  - `"Forbidden: Invalid admin activation code"` - wrong code
  - `"Bootstrap failed: Caller is already an admin"` - caller already has admin role
  - `"Unauthorized: Only admins can assign user roles"` - admin already claimed by different identity (REQ-2)

## Error Handling
- **Actor unavailable**: Explicit error shown, mutation blocked
- **Invalid code format**: Client-side validation error
- **Backend reject/trap**: Extracted via `extractBackendErrorMessage` utility
- **Admin already claimed (REQ-2)**: When backend returns "Unauthorized: Only admins can assign user roles", UI displays specific message explaining that admin panel is already activated under a different Internet Identity and must be reset or correct admin must sign in
- **Fallback**: Generic "Failed to activate admin panel. Please try again."

## Error Message Mappings
The UI maps backend error messages to user-friendly explanations:

| Backend Message Pattern | UI Message |
|------------------------|------------|
| "Only admins can assign user roles" | Admin panel already activated by different Internet Identity (reset required or sign in with correct admin) |
| "already been claimed" / "Admin role has already been claimed" | Admin panel already activated by another user |
| "Invalid admin activation code" / "Forbidden" | Invalid activation code |
| "4 digits" | Display backend message directly |
| "Backend connection unavailable" | Display backend message directly |
| Other meaningful backend messages | Display backend message directly |
| No backend message | Generic failure message |

## Component Usage
This flow is part of the **authorization** prefabricated component's role-based access control system. The component provides:
- One-time admin bootstrapping via secure activation code
- Role-based access guards (`AdminGuard`)
- Automatic role state management via React Query

## Alternative Implementations
A code search confirmed there are **no alternative activation paths**. The legacy `useBootstrapAdmin` hook is now an alias of `useAdminActivation`, ensuring all activation flows route through the same implementation.

## State Management
- **React Query keys**:
  - `['currentUserRole']` - user's role (admin/user/guest)
  - `['isCallerAdmin']` - boolean admin check
- **Invalidation**: Both keys invalidated and refetched after successful activation
- **Navigation**: Delayed 1.5s after success to allow state refresh

## Testing Notes
- Default code `2537` should activate admin on first use
- Second attempt with same code should show "already claimed" error
- Invalid codes should show "Invalid activation code" error
- Actor unavailability should block submission with clear error
- Attempting activation when admin is already claimed by different identity should show "Only admins can assign user roles" error with clear explanation (REQ-2)

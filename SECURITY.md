# Security Checklist

This project should be built with security as a default, not as a cleanup step later.

## Current frontend rules

- Never commit real secrets, tokens, API keys, or `.env` files.
- Keep backend URLs and auth-related values in Vercel environment variables.
- Store only the auth keys this app needs and remove only those keys on logout.
- Protect logged-in routes with route guards before rendering dashboard pages.
- Send JWTs only through the configured `Authorization` header.
- Treat profile and protected API failures gracefully and redirect users to sign in when authentication is missing or invalid.

## Required checks for every new backend endpoint

Before connecting a new endpoint in the frontend, confirm:

1. The exact URL path and HTTP method.
2. Whether the endpoint requires authentication.
3. The exact request body field names.
4. The exact response shape for success and error cases.
5. The CORS allowlist includes:
   - local development origin
   - Vercel production origin
6. Sensitive data is not returned unless the user is authorized to see it.

## JWT handling baseline

- Access token key: `shilingi_access_token`
- Refresh token key: `shilingi_refresh_token`
- On logout, remove only auth storage keys.
- Do not log tokens to the console.
- If a protected request returns `401`, redirect the user back to sign in.

## Frontend review steps before each release

1. Sign up with a new account.
2. Sign in and confirm the access token is stored.
3. Open a protected page and confirm the request sends `Authorization: Bearer ...`.
4. Confirm logout removes auth keys and blocks protected routes.
5. Check browser console for failed requests, exposed stack traces, or sensitive payloads.
6. Verify Vercel environment variables match the live backend contract.

## Next security improvements

- Add token refresh handling for expired access tokens.
- Add a single shared API client for authenticated requests.
- Add user-facing handling for `401`, `403`, and validation errors.
- Add backend-confirmed profile endpoint validation.
- Add automated checks for linting, dependency review, and production build verification.

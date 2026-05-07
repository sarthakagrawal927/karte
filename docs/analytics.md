# Visitor Analytics Identity

Linkchat uses a combination of first-party cookies and `localStorage` to track unique visitors while maintaining anonymity.

## Implementation Details

### `lc_vid` Cookie
- **Name**: `lc_vid`
- **Type**: First-party cookie.
- **Value**: A random opaque UUID (v4).
- **Expiry**: 2 years from the last interaction.
- **Attributes**:
  - `SameSite=Lax`: Balanced security and usability.
  - `Secure`: Enabled in production to ensure the cookie is only sent over HTTPS.
  - `httpOnly=false`: Allows client-side JavaScript to read the cookie for synchronization with `localStorage`.

### `localStorage` Fallback
The `linkchat_visitor_id` key in `localStorage` serves as a fallback and mirror for the `lc_vid` cookie. This ensures that:
1. Identity is preserved if cookies are disabled but `localStorage` is available.
2. Identity is more stable if `localStorage` is cleared but cookies remain.
3. Client-side event batching can consistently identify the visitor even before the first tracking API response is received.

## Identity Stability & Limits

While this dual-storage approach improves the stability of visitor counting, the following scenarios will still result in a visitor being counted as "new":

1. **Incognito / Private Browsing**: Most browsers clear both cookies and `localStorage` when the private session ends.
2. **Manual Clearing**: Users manually clearing their browser history, cookies, or site data.
3. **Multiple Devices / Browsers**: A user visiting from a phone and then a laptop (or switching from Chrome to Safari) will be treated as two separate visitors.
4. **Privacy Extensions / Settings**: Some advanced privacy settings or extensions might block first-party cookies or `localStorage` entirely.
5. **Cross-Site Tracking Prevention**: While we use first-party cookies, some browsers have aggressive expiration policies for all cookies set via JavaScript or API responses (e.g., Apple's ITP may limit cookie life to 7 days in certain scenarios).

## Privacy Compliance

- **No PII**: The visitor ID is a completely random UUID and contains no personally identifiable information.
- **No Fingerprinting**: We do not use browser fingerprinting techniques (canvas hashing, font enumeration, etc.) to link identities across clearing events.
- **Anonymous**: Visitor IDs are not linked to any user accounts unless the user explicitly logs in or provides contact information.

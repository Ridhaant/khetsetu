# KhetSetu native India-wide assisted marketplace

`App.tsx` is a React Native / Expo application for the **India-wide assisted B2B sourcing service**. It uses native views, forms, controls and device secure storage. It is not a WebView. The previous development marketplace is retained in `LegacyMarketplace.tsx` and is not mounted by the default app.

## What the app does

- Buyer requirements for retailers, wholesalers, restaurants, caterers and other businesses; farmer/FPO supply enquiries.
- Produce/variety, quantity, kg/quintal/tonne/crate/box, grade, timing, repeat frequency, contact and business details.
- Buyer delivery and farmer pickup requests accept any six-digit Indian PIN format starting with **1–9**, across India. The PIN field starts blank to avoid assigning a buyer to Mumbai by default. Format validation does not prove that the postal location exists or that a carrier serves it; operations confirms actual stock, location and delivery before an order.
- Explicit contact consent, English/Hindi core screens, native accessibility labels and controls of at least 48dp.
- Submit a real request to the same hosted pilot API as the website; show a server reference only after the API succeeds.
- Retrieve private receipt statuses, customer updates and supplier quotations. Delivered comparisons include produce, packing, delivery, fees, total and effective unit price. Quote selection and confirmation are handled by operations.
- Confirmed withdrawal through a native alert, then call the API to withdraw/anonymize the request and remove the private receipt from this device.
- Direct call/email support: **+91 70216 10641**, **redantthakur@gmail.com**. Website terms/privacy links open in the system browser.

There is no demo role selection, public administration, payment collection, automatic order confirmation or claimed cheapest-price guarantee in this default application.

## Endpoint and local setup

```powershell
cd apps/mobile
npm install
Copy-Item .env.example .env
# EXPO_PUBLIC_PILOT_URL defaults to the same hosted pilot as the website.
npx expo install --check
npm start
```

Default: `https://khetsetu-farm-market.dampcliff128.chatgpt.site`. The endpoint must be publicly reachable for customer devices. If the Site is private, sign-in access may block native API requests; source code alone does not prove public access. The server remains authoritative for serviceability, rates, validation and status.

`EXPO_PUBLIC_*` values are public configuration, not secrets. `EXPO_PUBLIC_PILOT_URL` is the server origin without `/api`; the app calls `/api/pilot/...`. Production endpoints require HTTPS. For a local emulator, `http://10.0.2.2:PORT`, `http://127.0.0.1:PORT` or `http://localhost:PORT` is accepted. A physical phone needs a reachable HTTPS staging endpoint; localhost refers to the phone itself.

## Retry, receipts and privacy

The app obtains cryptographically random credentials from `GET /api/pilot/new-request`, then submits `POST /api/pilot/requests` with an `Idempotency-Key`. The same normalized request retains its key, receipt secret and body across network retries **within the running app session**. Editing requirement/contact fields creates new credentials on the next submission. A request reference means “received”, not “paid” or “order confirmed”.

Only `{ id, reference, secret }` for the ten latest receipts is persisted using Expo SecureStore with device-only, unlocked keychain accessibility. No name, phone, business details, notes, request body or quotes are persisted to AsyncStorage by the default app. Contact forms are held in memory and are lost when the app closes; offline drafts are deliberately not enabled. The legacy file retains its old separate basket/preferences implementation but is not imported by the default app.

The receipt secret is sent only as `Authorization: Bearer ...` to its receipt endpoint; it is not placed in a URL or rendered. It acts as a bearer credential, not proof of a verified phone or authenticated account. Do not share it. Uninstalling the app or clearing secure storage may lose access to receipts. Account synchronization and cross-device recovery are not implemented. If submission succeeds but its response is lost, retry before closing the app. If the app is closed with an uncertain result, contact operations rather than blindly resubmitting. Secure-storage failure is explicitly reported so the user can keep the reference and contact support.

`GET /api/pilot/receipts/:id` retrieves the non-contact receipt. `DELETE` withdraws it after user confirmation. The server privacy policy governs retention/anonymization; the app does not claim to erase external delivery or transaction records that operations may separately require.

## Checks on 25 November 2026

All nine native tests and the full Expo TypeScript check (including the retained development marketplace) passed. Tests cover national PIN formats, invalid/zero-leading PINs, configured denials, stale/unavailable serviceability, selected PIN in the submitted request, idempotent retry and receipt privacy. Metro exported the current production Hermes bundles for Android and iOS (607/609 modules, about 1.6 MB each). These are JavaScript bundles, not signed native applications or device tests. Expo previously checked the dependency versions against its bundled compatibility list. The repository includes the npm lockfile. Android prebuild generated a native project. Device testing, signing and distribution are separate checks recorded in the delivery verification report.

```powershell
npm ci
npm run typecheck
npm test
npx expo export --platform android --platform ios
```
## Retained development marketplace

`LegacyMarketplace.tsx` is retained as a separate development client, not the default assisted application. Its existing buyer session and selected language/PIN preferences are restored; Mumbai **400008** remains only its sample default. The selected PIN is sent to catalogue, serviceability, checkout and RFQ requests. Changing the PIN resets the checkout idempotency key so it cannot be reused for another delivery location.

The development client calls `GET /api/v1/serviceability/:pin` through the configured `EXPO_PUBLIC_API_URL`. It honors the returned `serviceable` decision for that exact PIN, including configured denials and restricted pilot mode. New and restored locations are rechecked; serviceability decisions are not persisted. Checkout and RFQ submission remain disabled until both catalogue and current PIN eligibility load successfully. A stale response for another PIN, failed check, offline sample fallback or missing API does not authorize transactions. Offline sample browsing labels valid PINs as format-only demonstration eligibility and makes no delivery promise.

The development API's national mode is configuration for a demo, not carrier integration or verified nationwide logistics. It exposes `scope`, `validation: "format-only"`, `logisticsVerified: false`, and an eligibility reason. The server rechecks policy and stock for protected operations. Changing scope does not manufacture additional farmers or inventory; the API catalogue remains authoritative.

The default assisted app continues to use `/api/pilot/...` and private receipt credentials. It accepts national sourcing requests without adding a new serviceability endpoint. Its contact form and PIN remain in memory, not in saved device drafts; receipt retrieval/withdrawal behavior is unchanged.

## Build and release

Use `npm ci` on the build machine and review Expo diagnostics before distribution. Use Node meeting React Native's declared requirement (`^22.13.0 || ^24.3.0 || >=26.0.0`). Configure owned app identifiers in `app.json`; current identifiers need ownership review. Add original icons/splash/store assets and configure your own EAS project ID and signing credentials.

```powershell
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
```

Preview and production EAS profiles disable demo mode. Android preview produces an internal APK; iOS internal distribution requires an Apple Developer account/registered devices. Local iOS builds require macOS/Xcode. EAS can request cloud builds from Windows after account setup. Never commit keystores, certificates or provisioning profiles.

Before distributing, test the actual shared hosted API on physical Android/iOS: submission, lost-response retry, receipt restore, quote comparison, update, withdrawal, server errors, slow/offline network, app kill/resume, large fonts, Hindi and TalkBack/VoiceOver. Check signed application manifests, current store requirements, Data Safety/App Privacy declarations, support, terms, privacy and deletion flows against the actual deployed data handling.

No precise location, camera, microphone, gallery or push permission is required by this assisted-pilot flow. Manual PIN entry is sufficient. Receipt access uses secure storage. The existing SecureStore backup plugin and blocked Android location/media/audio permissions are retained. Reassess native permissions and privacy declarations if uploads or notifications are added.

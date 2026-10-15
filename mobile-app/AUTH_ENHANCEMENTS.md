# Auth Screens Enhancements

## Overview
Complete refactor of authentication system with professional UI, localStorage persistence, and unified user experience.

## ✅ Implemented Features

### 1. **localStorage Persistence (AsyncStorage)**
- **File**: `mobile-app/store/auth.store.ts`
- User and token data persists across app restarts
- Automatic hydration on app launch via `_layout.tsx`
- Secure async operations with error handling
- Keys: `aparai_user`, `aparai_token`

**Usage**:
```typescript
const { user, token, setUser, setToken, hydrate } = useAuthStore();

// Save user and token
await setUser(userData);
await setToken(tokenData);

// Logout (clears both)
await useAuthStore.logout();
```

### 2. **Unified Dashboard for Partner/Family**
- **Scope**: Signup Screen (`signup.tsx`)
- Replaced 3-role system (Mother/Partner/Family) with 2-role system:
  - **Mother**: Pregnancy tracking mode → Onboarding flow
  - **Caregiver**: Partner/Family unified mode → Direct dashboard access
- Same dashboard UI for both Partner and Family roles
- Simplified role toggle with visual icons (Heart vs Users)

**Changes**:
- `selectedRole: 'MOTHER' | 'PARTNER' | 'FAMILY'` → `isMother: boolean`
- Role persisted as: `MOTHER` or `CAREGIVER`

### 3. **Terms & Privacy Modals**
- **File**: `mobile-app/components/modals/TermsPrivacyModal.tsx`
- Reusable modal component accepting `type: 'terms' | 'privacy'`
- Clickable links in signup form open modals:
  ```
  Accept Terms [Link] and Privacy Policy [Link]
  ```
- Full Terms of Use content (10 sections)
- Full Privacy Policy content (10 sections with HIPAA/GDPR/DPDP compliance)
- Modal animations: Slide from bottom
- Close via X button or "I Understand & Accept" button

**Usage**:
```tsx
<TermsPrivacyModal
  visible={termsModalVisible}
  type="terms"
  onClose={() => setTermsModalVisible(false)}
/>
```

### 4. **Apple Logo Display**
- **Sign In Screens**: Both Login and Signup
- Apple ID button now displays Unicode Apple logo: `􀄨`
- Logo displays in both:
  - Normal state (button at rest)
  - Loading state (alongside spinner during auth)
- Font size: 18px normal, 14px when loading

**Styles Added**:
```typescript
appleLogo: 18px, color: #FFFFFF
appleLogoSmall: 14px (loading state)
loadingAppleRow: Flexbox with gap for logo + spinner
```

### 5. **Professional Lucide Icons** (from previous session)
All emojis removed and replaced with Lucide icons:
- Auth screens: Mail, Phone, Lock, Eye, EyeOff, User, Heart, Users, AlertCircle, ArrowRight
- Header: Bell (notifications), Users (partner sync)
- Terms modal: X (close)

### 6. **localStorage Data Structure**

**User Object** (aparai_user):
```json
{
  "id": "usr_1729024800000",
  "name": "Maya Sharma",
  "email": "maya@example.com",
  "phone": "+91 98765 43210",
  "role": "MOTHER|CAREGIVER",
  "inviteCode": "AP-8492" (optional, for caregivers),
  "createdAt": "2026-10-14T12:00:00.000Z",
  "lastLogin": "2026-10-14T12:05:00.000Z"
}
```

**Token** (aparai_token):
```
mock_jwt_token_1729024800000
```

---

## 📁 Modified Files

| File | Changes |
|------|---------|
| `store/auth.store.ts` | AsyncStorage persistence, hydrate() method, error handling |
| `components/modals/TermsPrivacyModal.tsx` | NEW: Reusable modal component |
| `app/(auth)/signup.tsx` | Unified role toggle, Terms modal links, localStorage |
| `app/(auth)/login.tsx` | localStorage integration, Apple logo |
| `app/_layout.tsx` | Auto-hydrate auth on app launch |
| `package.json` | Added `@react-native-async-storage/async-storage@^1.23.1` |

---

## 🧪 Testing Checklist

- [ ] **Sign Up Flow**
  - [ ] Toggle Mother/Caregiver roles
  - [ ] Click "Terms of Use" link → Modal opens with full content
  - [ ] Click "Privacy Policy" link → Modal opens with full content
  - [ ] Accept checkbox enables Submit button
  - [ ] Submit creates user + saves to AsyncStorage
  - [ ] Apple logo displays on loading

- [ ] **Sign In Flow**
  - [ ] Email/Phone toggle works
  - [ ] Sign in with valid credentials
  - [ ] Apple ID button shows logo + spinner during loading
  - [ ] User/token persists in AsyncStorage
  - [ ] Apple logo displays correctly

- [ ] **Persistence**
  - [ ] Complete signup → close app → reopen
  - [ ] User data should auto-restore (no re-auth needed)
  - [ ] Logout clears both user + token from storage
  - [ ] App launches with hydration state

- [ ] **Modal Behavior**
  - [ ] Modal slides up from bottom
  - [ ] X button closes modal
  - [ ] "I Understand & Accept" button closes modal
  - [ ] Scrollable content on both modals
  - [ ] Both modals use same styling

---

## 🔐 Security Considerations

- **AsyncStorage**: Client-side only. For production, move sensitive data to secure device storage (Keychain/Keystore)
- **Tokens**: Currently mock tokens. Replace with real JWT from backend
- **Password**: Currently plain text in mock. Use bcrypt/argon2 on backend
- **Privacy**: Full HIPAA/GDPR/DPDP compliant text in modals

---

## 🚀 Next Steps (Future)

1. **Backend Integration**
   - Replace mock auth with actual API calls
   - Implement real JWT token handling
   - Add refresh token flow

2. **Enhanced Security**
   - Move tokens to Secure Enclave (iOS) / Keystore (Android)
   - Implement biometric auth (Face ID / Touch ID)
   - Add session timeout

3. **Additional Features**
   - Forgot Password flow with email verification
   - Two-factor authentication
   - Social login callback handling
   - Deep linking for email verification

4. **Dashboard Unification**
   - Ensure Partner/Caregiver see same dashboard as Mother
   - Implement data-sharing permissions UI
   - Add family member management screens

---

## 📋 Files to Install

Run after pulling changes:
```bash
npm install
```

This installs `@react-native-async-storage/async-storage` dependency.

---

**Last Updated**: October 14, 2026  
**Status**: ✅ Ready for Testing

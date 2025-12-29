# Google OAuth 2.0 Implementation Plan for DataWorld

## Executive Summary
This plan outlines a comprehensive strategy for integrating Google OAuth 2.0 authentication into DataWorld's login and signup flows. This will streamline user onboarding, improve security, and provide a seamless authentication experience.

---

## Phase 1: Setup & Configuration

### 1.1 Google Cloud Console Setup
**Timeline**: 1-2 hours

**Steps**:
1. Create/access Google Cloud Project
   - Navigate to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project: `DataWorld`
   
2. Enable Google+ API
   - Go to APIs & Services → Library
   - Search for "Google+ API"
   - Click Enable
   
3. Create OAuth 2.0 Credentials
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:5173/auth/google/callback
     http://localhost:5174/auth/google/callback
     https://yourdomain.com/auth/google/callback (production)
     https://yourdomain.com/login
     https://yourdomain.com/signup
     ```
   - Save Client ID and Client Secret

4. Store Credentials Securely
   ```env
   # client/.env.local
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   
   # server/.env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
   ```

### 1.2 Dependencies Installation

**Client-side**:
```bash
npm install @react-oauth/google
npm install js-cookie
npm install @types/js-cookie --save-dev
```

**Server-side**:
```bash
npm install google-auth-library
npm install jsonwebtoken
```

---

## Phase 2: Client-Side Implementation

### 2.1 Google OAuth Provider Setup

**File**: `client/src/main.tsx`

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';

ReactDOM.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
  document.getElementById('root')
);
```

### 2.2 Create useGoogleAuth Hook

**File**: `client/src/hooks/useGoogleAuth.ts`

```typescript
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Cookies from 'js-cookie';

export const useGoogleAuth = () => {
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        // Exchange code for backend session
        const response = await axios.post(
          '/api/auth/google/callback',
          { code: codeResponse.code },
          { 
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
          }
        );

        // Store auth token
        if (response.data.token) {
          Cookies.set('authToken', response.data.token, {
            httpOnly: false,
            secure: true,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 // 7 days
          });
        }

        // Redirect to dashboard
        window.location.href = '/app';
      } catch (error) {
        console.error('Google login failed:', error);
        // Show error toast
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      // Show error notification
    },
    flow: 'auth-code',
    scope: 'openid profile email',
  });

  return { login };
};
```

### 2.3 Update Login Page Component

**File**: `client/src/pages/Login.tsx`

**Key Changes**:
- Import `useGoogleAuth` hook
- Replace button `onClick` handler
- Add loading state during authentication
- Add error handling with toast notifications

```typescript
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login: loginWithGoogle } = useGoogleAuth();

  const handleGoogleClick = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setIsLoading(false);
      // Show error toast
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border-light dark:border-border-dark rounded-lg bg-surface-light dark:bg-surface-dark text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M12.0003 20.45c4.6667 0 7.9167-3.25 7.9167-8.1..." fill="currentColor"></path>
      </svg>
      <span className="text-sm font-medium">
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>
  );
};
```

### 2.4 Update Signup Page Component

**File**: `client/src/pages/Signup.tsx`

**Key Changes**:
- Similar to Login page
- Pre-fill form fields with Google profile data
- Handle "Account already exists" flow

```typescript
const handleGoogleSignup = async () => {
  setIsLoading(true);
  try {
    // Upon successful Google auth, pre-populate fields
    // If user exists, redirect to login with message
    // If new user, redirect to dashboard or ask for additional info
    await loginWithGoogle();
  } catch (error) {
    setIsLoading(false);
  }
};
```

### 2.5 Create Auth Callback Route

**File**: `client/src/pages/AuthCallback.tsx`

```typescript
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      // Handle the callback - exchange code for token
      // This is typically handled by the OAuth library
      navigate('/app');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-muted-light dark:text-text-muted-dark">
          Completing your sign-in...
        </p>
      </div>
    </div>
  );
};
```

### 2.6 Update App Router

**File**: `client/src/App.tsx`

```typescript
<Route path="/auth/google/callback" element={<AuthCallback />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
```

---

## Phase 3: Server-Side Implementation

### 3.1 Create Google Auth Controller

**File**: `server/src/controllers/googleAuthController.ts`

```typescript
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Verify the token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const { email, name, picture, sub } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        email,
        fullName: name,
        avatar: picture,
        googleId: sub,
        isEmailVerified: true, // Google emails are pre-verified
        authProvider: 'google',
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = sub;
      user.authProvider = 'google';
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.fullName,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set secure cookie
    res.cookie('authToken', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success response
    return res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(400).json({ error: 'Authentication failed' });
  }
};
```

### 3.2 Create Google Auth Routes

**File**: `server/src/routes/googleAuth.ts`

```typescript
import express from 'express';
import { googleAuthCallback } from '../controllers/googleAuthController';

const router = express.Router();

router.post('/callback', googleAuthCallback);

export default router;
```

### 3.3 Update Server Index

**File**: `server/src/index.ts`

```typescript
import googleAuthRoutes from './routes/googleAuth';

// Add route
app.use('/api/auth/google', googleAuthRoutes);
```

### 3.4 Update User Model

**File**: `server/src/models/User.ts`

Add new fields:
```typescript
interface IUser extends Document {
  // ... existing fields
  googleId?: string;
  authProvider?: 'email' | 'google' | 'microsoft';
  isEmailVerified: boolean;
  avatar?: string;
}

const userSchema = new Schema({
  // ... existing fields
  googleId: { type: String, sparse: true },
  authProvider: { type: String, enum: ['email', 'google', 'microsoft'], default: 'email' },
  isEmailVerified: { type: Boolean, default: false },
  avatar: { type: String },
});
```

---

## Phase 4: Integration & Testing

### 4.1 Error Handling Strategy

**Scenarios to handle**:
1. User cancels Google login
2. Google auth fails (network error, invalid credentials)
3. Email already registered via different auth method
4. Session expires during callback
5. CORS/cookie issues

**Implementation**:
```typescript
// Toast notifications for user feedback
import { useToast } from '../hooks/useToast';

const { showError, showSuccess } = useToast();

// Error messages
const errorMessages = {
  POPUP_CLOSED: 'Sign-in was cancelled',
  NETWORK_ERROR: 'Network error. Please check your connection',
  INVALID_CODE: 'Invalid authorization code',
  EMAIL_EXISTS: 'This email is already registered',
  SERVER_ERROR: 'An error occurred. Please try again',
};
```

### 4.2 Testing Checklist

- [ ] Login with Google on development
- [ ] Login with Google on production domain
- [ ] Signup with Google on development
- [ ] Verify user data is correctly populated
- [ ] Test linking Google to existing email account
- [ ] Test token refresh/expiration
- [ ] Test logout flow
- [ ] Test account linking prevention
- [ ] Test CORS headers
- [ ] Test cookie security settings
- [ ] Test dark mode compatibility
- [ ] Test mobile responsiveness
- [ ] Test error handling for all scenarios

### 4.3 Performance Optimization

```typescript
// Lazy load Google script
const loadGoogleSDK = () => {
  if (!window.google) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
  }
};

// Implement request debouncing
const debouncedLogin = debounce(loginWithGoogle, 300);
```

---

## Phase 5: Security Considerations

### 5.1 Security Best Practices

1. **CSRF Protection**
   ```typescript
   // Generate and validate CSRF tokens
   const csrfToken = generateToken();
   Cookies.set('csrfToken', csrfToken);
   ```

2. **State Parameter Validation**
   ```typescript
   const state = generateRandomState();
   sessionStorage.setItem('oauth_state', state);
   // Validate on callback
   ```

3. **Nonce Validation**
   ```typescript
   const nonce = generateNonce();
   // Include in request, verify in token
   ```

4. **Rate Limiting**
   ```typescript
   // Limit login attempts
   app.post('/api/auth/google/callback', 
     rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
     googleAuthCallback
   );
   ```

5. **HTTPS Enforcement**
   - Always use HTTPS in production
   - Set `Secure` flag on cookies
   - Use `SameSite=Lax` for cookies

### 5.2 Data Privacy

- Only request necessary scopes: `openid profile email`
- Store minimal user data
- Implement data retention policies
- Add privacy policy update about Google data handling

---

## Phase 6: Monitoring & Analytics

### 6.1 Key Metrics to Track

```typescript
// Analytics events
analytics.track('google_login_started');
analytics.track('google_login_success', { userId, email });
analytics.track('google_login_error', { errorCode, errorMessage });
analytics.track('google_signup_started');
analytics.track('google_signup_success', { userId });
```

### 6.2 Error Logging

```typescript
// Log auth errors
logger.error('Google OAuth Error', {
  timestamp: new Date(),
  errorCode: error.code,
  errorMessage: error.message,
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});
```

---

## Phase 7: Deployment Checklist

- [ ] Add Google Client ID to production environment
- [ ] Update redirect URIs in Google Cloud Console
- [ ] Configure production domain in CORS settings
- [ ] Set secure cookie flags for production
- [ ] Enable HTTPS
- [ ] Test on production domain
- [ ] Monitor error rates post-deployment
- [ ] Prepare rollback plan
- [ ] Document the feature for team
- [ ] Update user documentation
- [ ] Set up automated backups

---

## Timeline & Resource Allocation

| Phase | Duration | Resources | Priority |
|-------|----------|-----------|----------|
| Google Cloud Setup | 2 hours | Backend Dev | Critical |
| Client Implementation | 4-6 hours | Frontend Dev | Critical |
| Server Implementation | 4-6 hours | Backend Dev | Critical |
| Integration & Testing | 4-6 hours | Full Stack Dev | Critical |
| Security Review | 2 hours | Security + Dev | High |
| Deployment | 1-2 hours | DevOps + Backend | Critical |
| **Total** | **17-24 hours** | **2-3 devs** | — |

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Google API rate limits | Low | Medium | Implement caching, monitor usage |
| Token expiration issues | Medium | Medium | Auto-refresh tokens, clear error messaging |
| CORS/cookie issues | Medium | High | Test on multiple domains, use SameSite settings |
| User privacy concerns | Low | High | Clear privacy policy, transparent data handling |
| Integration complexity | Medium | Medium | Use well-maintained libraries (@react-oauth/google) |

---

## Future Enhancements

1. **Social Login Hub**
   - Add GitHub, LinkedIn, Okta OAuth
   - Unified login experience

2. **Account Linking**
   - Allow linking multiple auth providers
   - Merge existing email accounts with OAuth

3. **Advanced Analytics**
   - Track conversion funnels
   - A/B test login flows

4. **Two-Factor Authentication**
   - Add 2FA for enhanced security
   - Support authenticator apps

5. **Account Recovery**
   - OAuth-based account recovery
   - Backup authentication methods

---

## Documentation & Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google npm Package](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

**Document Version**: 1.0  
**Last Updated**: December 28, 2025  
**Owner**: Development Team  
**Status**: Ready for Implementation

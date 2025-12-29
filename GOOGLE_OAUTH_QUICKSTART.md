# Google OAuth Implementation - Quick Start Guide

## 🚀 5-Minute Overview

This guide gets you from zero to implementing Google OAuth in DataWorld.

---

## 📋 What Just Changed

### ✅ Completed
- Microsoft login button **removed** from both Login & Signup pages
- Button now shows "Continue with Google" (full-width)
- UI is cleaner and more focused

### ⏭️ Next Steps
- Implement Google OAuth (see detailed plan in GOOGLE_AUTH_IMPLEMENTATION_PLAN.md)

---

## 🎯 Three Implementation Paths

### Path A: Quick Implementation (2 days)
**For teams that need OAuth ASAP**
1. Set up Google Cloud project (2 hours)
2. Add @react-oauth/google library (30 min)
3. Create useGoogleAuth hook (2 hours)
4. Wire up Login page (2 hours)
5. Test & debug (2 hours)

**Total**: ~8.5 hours | **One developer**

---

### Path B: Standard Implementation (1 week)
**Recommended approach with full testing**
1. Google Cloud setup (2 hours)
2. Client-side implementation (6 hours)
3. Server-side implementation (6 hours)
4. Testing & QA (6 hours)
5. Security review (2 hours)

**Total**: ~22 hours | **2 developers**

---

### Path C: Enterprise Implementation (2 weeks)
**With full monitoring, analytics, and security**
1. All of Path B (22 hours)
2. Advanced monitoring (4 hours)
3. Rate limiting & abuse prevention (3 hours)
4. Analytics integration (2 hours)
5. Staged rollout & monitoring (4 hours)

**Total**: ~35 hours | **3 developers**

---

## 🔧 Implementation Checklist

### Step 1: Google Cloud Setup (Do First)
```bash
# 1. Go to https://console.cloud.google.com
# 2. Create new project called "DataWorld"
# 3. Search for "Google+ API" and enable it
# 4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
# 5. Choose "Web application"
# 6. Add authorized redirect URIs:
#    - http://localhost:5173/auth/google/callback
#    - https://yourdomain.com/auth/google/callback

# Copy the Client ID and Secret
```

**Save these values:**
```env
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

---

### Step 2: Install Dependencies
```bash
# Client
cd client
npm install @react-oauth/google js-cookie
npm install @types/js-cookie --save-dev

# Server
cd server
npm install google-auth-library jsonwebtoken
```

---

### Step 3: Wrap App with GoogleOAuthProvider
**File**: `client/src/main.tsx`

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
  document.getElementById('root')
);
```

---

### Step 4: Create useGoogleAuth Hook
**File**: `client/src/hooks/useGoogleAuth.ts`

```typescript
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export const useGoogleAuth = () => {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Send auth code to backend
        const result = await axios.post('/api/auth/google/callback', {
          code: response.code
        });
        
        // Redirect on success
        window.location.href = '/app';
      } catch (error) {
        console.error('Auth failed:', error);
      }
    },
    onError: () => console.error('Login failed'),
    flow: 'auth-code',
  });

  return { login };
};
```

---

### Step 5: Update Login Page Button
**File**: `client/src/pages/Login.tsx`

```typescript
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export const Login = () => {
  const { login } = useGoogleAuth();

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center gap-2 px-4 py-2.5 
        border border-border-light dark:border-border-dark rounded-lg 
        bg-surface-light dark:bg-surface-dark w-full"
    >
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};
```

---

### Step 6: Create Server Endpoint
**File**: `server/src/routes/auth.ts`

```typescript
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

app.post('/api/auth/google/callback', async (req, res) => {
  const { code } = req.body;

  try {
    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code);
    
    // Verify token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, picture } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, fullName: name, avatar: picture });
      await user.save();
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(400).json({ error: 'Authentication failed' });
  }
});
```

---

## 🧪 Testing

### Test Checklist
- [ ] Click Google button on login page
- [ ] Successfully authenticate with Google
- [ ] User is created/found in database
- [ ] Redirected to dashboard
- [ ] Test with new email (creates user)
- [ ] Test with existing email (logs in)
- [ ] Check dark mode works
- [ ] Check mobile responsiveness
- [ ] Test error handling

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid Client ID"
**Solution**: Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env.local`

### Issue: "Redirect URI mismatch"
**Solution**: Add your redirect URL to Google Cloud Console > Credentials

### Issue: CORS errors
**Solution**: Add proper headers in server response
```typescript
res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
res.header('Access-Control-Allow-Credentials', 'true');
```

### Issue: Token not saving
**Solution**: Check cookie settings
```typescript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});
```

---

## 📊 Expected Workflow

```
User clicks "Continue with Google"
    ↓
Google login popup appears
    ↓
User authenticates with Google
    ↓
Google returns authorization code
    ↓
Frontend sends code to backend (/api/auth/google/callback)
    ↓
Backend verifies code with Google
    ↓
Backend creates/finds user in database
    ↓
Backend generates JWT token
    ↓
Backend returns token to frontend
    ↓
Frontend stores token (cookie/localStorage)
    ↓
Frontend redirects to /app (dashboard)
    ↓
✅ User is authenticated!
```

---

## 📚 Files to Reference

1. **Detailed Implementation**: `GOOGLE_AUTH_IMPLEMENTATION_PLAN.md`
2. **Quick Summary**: `MIGRATION_SUMMARY.md`
3. **Task Report**: `TASK_COMPLETION_REPORT.md`
4. **Updated Code**:
   - `client/src/pages/Login.tsx`
   - `client/src/pages/Signup.tsx`

---

## 🎓 Key Concepts

**OAuth 2.0 Flow in Simple Terms**:
1. User says "Login with Google"
2. We ask Google to authenticate the user
3. Google confirms identity, gives us a code
4. We trade the code for a token
5. Token proves user is who they say they are
6. User is logged in!

**Why This is Better**:
- ✅ User doesn't share password with us
- ✅ Google handles security
- ✅ Easy signup (auto-fill name, email, avatar)
- ✅ Users expect it (familiar flow)

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install @react-oauth/google js-cookie

# Check environment variables
cat .env.local
cat ../.env

# Test the endpoint
curl -X POST http://localhost:5000/api/auth/google/callback \
  -H "Content-Type: application/json" \
  -d '{"code":"your_auth_code"}'

# Run dev server
npm run dev
```

---

## 📞 Need Help?

**Found in Documentation**:
- Implementation phases: `GOOGLE_AUTH_IMPLEMENTATION_PLAN.md` → Phase 1-7
- Code examples: Same file → Phase 2 & 3
- Testing guide: Same file → Phase 4
- Security: Same file → Phase 5
- Deployment: Same file → Phase 7

**Common Questions**:
- See TASK_COMPLETION_REPORT.md for FAQ section
- See MIGRATION_SUMMARY.md for quick reference

---

## ✅ Success Criteria

After implementation, verify:
- [ ] Users can login with Google
- [ ] Users can signup with Google
- [ ] Existing email accounts get linked
- [ ] User data is populated correctly
- [ ] Dark mode works
- [ ] Mobile works
- [ ] Errors show helpful messages
- [ ] Performance is good

---

## 🎯 Timeline Estimate

| Task | Time | Who |
|------|------|-----|
| Google Cloud Setup | 2h | Backend Dev |
| Client Implementation | 4h | Frontend Dev |
| Server Implementation | 4h | Backend Dev |
| Testing | 3h | Both |
| **Total** | **~13h** | **2 devs** |

---

**Ready to Start?**

1. Read: `GOOGLE_AUTH_IMPLEMENTATION_PLAN.md` (full details)
2. Do: Follow steps 1-6 above
3. Test: Use testing checklist
4. Deploy: Follow Phase 7 in detailed plan

Good luck! 🚀

---

**Document Version**: 1.0  
**Last Updated**: December 28, 2025

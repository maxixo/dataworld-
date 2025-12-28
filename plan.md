# DataWorld Bug Fix Work Plan

## Overview
This plan addresses 46 identified issues across security, functionality, and code quality in the DataWorld project. Fixes are organized by priority to address critical security vulnerabilities first, followed by major bugs, then code quality improvements.

---

## Phase 1: CRITICAL Security Fixes (Do First)

### 1.1 Secure MongoDB Credentials
**Files**: `server/.env`
**Action**:
- Remove hardcoded credentials from .env file
- Generate new strong password for MongoDB user
- Update MongoDB Atlas with new credentials
- Update .env with new connection string
- Ensure .env is in .gitignore
- Verify no credentials in git history

### 1.2 Fix JWT Secret Fallback
**Files**:
- `server/src/controllers/authController.ts` (lines 57, 105)
- `server/src/middleware/auth.ts` (line 22)

**Changes**:
```typescript
// OLD: process.env.JWT_SECRET || 'secret'
// NEW:
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}
// Use jwtSecret for signing/verification
```

**Implementation**:
- Add JWT_SECRET validation at server startup
- Remove all fallback to 'secret'
- Server should fail to start if JWT_SECRET is missing

### 1.3 Add Dataset Ownership Authorization
**Files**: `server/src/controllers/datasetController.ts` (lines 66-90)

**Changes**:
```typescript
export const getDatasetById = async (req: Request, res: Response) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }

    // NEW: Check ownership
    if (dataset.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to dataset' });
    }

    res.json(dataset);
  } catch (err) {
    // error handling
  }
};
```

### 1.4 Fix Redis Implementation
**Files**: `server/src/config/redis.ts`

**Options**:
A. **Enable Redis properly** (if caching needed):
   - Uncomment real Redis client code
   - Add proper error handling
   - Add graceful fallback if Redis unavailable

B. **Remove caching entirely** (if not needed):
   - Delete `server/src/config/redis.ts`
   - Remove all Redis imports from `datasetController.ts`
   - Remove caching logic from getDatasetById

**Recommendation**: Option B (remove) unless caching is critical

### 1.5 Configure CORS Properly
**Files**: `server/src/index.ts` (line 16)

**Changes**:
```typescript
// OLD: app.use(cors())
// NEW:
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

**Environment**:
- Add `CLIENT_URL` to .env files

### 1.6 Implement Token Validation in AuthContext
**Files**: `client/src/context/AuthContext.tsx` (lines 28-39)

**Changes**:
```typescript
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        // Validate token with backend
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        // Token invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  initAuth();
}, []);
```

**Backend**: Create `/api/auth/me` endpoint if it doesn't exist

### 1.7 Add Admin Email Validation
**Files**: `server/src/controllers/authController.ts` (lines 35-36)

**Changes**:
```typescript
// Parse and validate admin emails
const adminEmails = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  : [];

const userEmail = email.toLowerCase();
const isAdmin = adminEmails.includes(userEmail);
```

---

## Phase 2: Type Safety & Major Bugs

### 2.1 Fix TypeScript Types (Remove @ts-ignore)
**Files**:
- `server/src/controllers/datasetController.ts`
- `server/src/controllers/blogController.ts`
- `server/src/middleware/auth.ts`
- `server/src/middleware/adminAuth.ts`

**Create**: `server/src/types/express.d.ts`
```typescript
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: 'user' | 'admin';
      };
    }
  }
}
```

**Changes**: Remove all `@ts-ignore` and replace `req.user` access with properly typed version

### 2.2 Fix User Schema
**Files**: `server/src/models/User.ts`

**Changes**:
```typescript
const userSchema = new Schema({
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    select: false  // NEW: Prevent password from being returned in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'  // NEW: Default role
  },
}, { timestamps: true });

// Add indexes
userSchema.index({ email: 1 });
```

### 2.3 Add Rate Limiting to Dataset Endpoints
**Files**:
- `server/src/routes/datasets.ts`
- Create: `server/src/middleware/rateLimiter.ts`

**Create middleware**:
```typescript
import rateLimit from 'express-rate-limit';

export const datasetUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes
  message: 'Too many uploads, please try again later'
});

export const datasetAccessLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later'
});
```

**Apply**:
```typescript
import { datasetUploadLimiter, datasetAccessLimiter } from '../middleware/rateLimiter';

router.post('/', auth, datasetUploadLimiter, uploadDataset);
router.get('/', auth, datasetAccessLimiter, getUserDatasets);
router.get('/:id', auth, datasetAccessLimiter, getDatasetById);
```

**Install**: `npm install express-rate-limit`

### 2.4 Allow Authors to Edit Own Posts
**Files**: `server/src/routes/blog.ts`, `server/src/controllers/blogController.ts`

**Route changes**:
```typescript
// Allow both authors and admins to update/delete
router.put('/:id', auth, updatePost);  // Remove adminAuth
router.delete('/:id', auth, deletePost);  // Remove adminAuth
```

**Controller changes** (updatePost & deletePost):
```typescript
export const updatePost = async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is author or admin
    const isAuthor = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update logic...
  } catch (err) {
    // error handling
  }
};
```

### 2.5 Add Input Validation
**Files**:
- `server/src/routes/blog.ts`
- `server/src/routes/datasets.ts`
- `server/src/validators/` (create new directory)

**Install**: `npm install express-validator`

**Create validators**:
```typescript
// server/src/validators/blog.ts
import { body } from 'express-validator';

export const blogPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be 5-200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50, max: 50000 })
    .withMessage('Content must be 50-50000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('tags')
    .isArray()
    .withMessage('Tags must be an array'),
];

// server/src/validators/dataset.ts
export const datasetValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be 3-100 characters'),
  body('data')
    .isArray({ min: 1 })
    .withMessage('Data must be a non-empty array'),
  body('columns')
    .isArray({ min: 1 })
    .withMessage('Columns must be a non-empty array'),
  body('rowCount')
    .isInt({ min: 1 })
    .withMessage('Row count must be a positive integer'),
];
```

**Apply to routes**:
```typescript
import { blogPostValidation } from '../validators/blog';
import { validationResult } from 'express-validator';

router.post('/', auth, adminAuth, blogPostValidation, createPost);

// In controller, check validation:
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
```

---

## Phase 3: Code Quality & Infrastructure

### 3.1 Implement Structured Logging
**Install**: `npm install winston`

**Create**: `server/src/config/logger.ts`
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

**Replace**: All `console.log` and `console.error` with:
```typescript
import logger from '../config/logger';

// console.log('message') → logger.info('message')
// console.error(err) → logger.error('Error message', { error: err })
```

### 3.2 Add Error Codes & Structured Errors
**Create**: `server/src/utils/errors.ts`
```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const ErrorCodes = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_UNAUTHORIZED: 'AUTH_003',
  DATASET_NOT_FOUND: 'DATA_001',
  DATASET_UNAUTHORIZED: 'DATA_002',
  BLOG_NOT_FOUND: 'BLOG_001',
  VALIDATION_ERROR: 'VAL_001',
  SERVER_ERROR: 'SRV_001',
};
```

**Create error handler middleware**: `server/src/middleware/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../config/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error('Operational error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Unknown errors
  logger.error('Unknown error', { error: err });

  return res.status(500).json({
    error: {
      code: 'SRV_001',
      message: 'Internal server error',
    },
  });
};
```

**Apply**: Replace generic error responses with AppError throws

### 3.3 MongoDB Connection Error Handling
**Files**: `server/src/index.ts` (lines 36-49)

**Changes**:
```typescript
const startServer = async () => {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error });
    process.exit(1);  // Exit if DB connection fails
  }
};

startServer();
```

### 3.4 Add Security Headers (CSP)
**Install**: `npm install helmet`

**Files**: `server/src/index.ts`

**Changes**:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 3.5 Add Health Check Endpoint
**Files**: `server/src/index.ts`

**Add**:
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### 3.6 Remove Test Endpoint
**Files**: `server/src/index.ts` (lines 28-32)

**Action**: Delete the `/api/test-error` endpoint entirely

### 3.7 Add Database Indexes
**Files**: All model files

**User.ts**:
```typescript
userSchema.index({ email: 1 });
```

**Dataset.ts**:
```typescript
datasetSchema.index({ user: 1 });
datasetSchema.index({ createdAt: -1 });
```

**BlogPost.ts**:
```typescript
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ published: 1 });
blogPostSchema.index({ createdAt: -1 });
blogPostSchema.index({ category: 1 });
```

---

## Phase 4: Frontend Improvements

### 4.1 Add Password Requirements Display
**Files**: `client/src/pages/Signup.tsx`

**Add below password input**:
```tsx
<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
  <p>Password must:</p>
  <ul className="list-disc list-inside ml-2">
    <li>Be at least 8 characters long</li>
    <li>Contain at least one letter</li>
    <li>Contain at least one number</li>
  </ul>
</div>
```

### 4.2 Add Frontend Error Handling Types
**Create**: `client/src/types/api.ts`
```typescript
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export const getErrorMessage = (err: any): string => {
  if (err.response?.data?.error?.message) {
    return err.response.data.error.message;
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  return 'An unexpected error occurred';
};
```

**Use in components**: Replace `err.response?.data?.message || 'Error'` with `getErrorMessage(err)`

---

## Phase 5: Testing & Validation

### 5.1 Test Critical Security Fixes
- [ ] Verify JWT secret validation on startup
- [ ] Test dataset access with different users (should get 403)
- [ ] Test CORS with different origins
- [ ] Test token validation on page load
- [ ] Test admin email validation

### 5.2 Test Rate Limiting
- [ ] Upload 11 datasets in 15 minutes (should hit limit)
- [ ] Make 101 dataset requests in 1 minute (should hit limit)

### 5.3 Test Type Safety
- [ ] Run `npm run build` on server - should have no TypeScript errors
- [ ] Verify no @ts-ignore directives remain

### 5.4 Test Authorization
- [ ] Non-admin user cannot edit others' datasets
- [ ] Author can edit own blog posts
- [ ] Non-author cannot edit others' posts

### 5.5 Integration Tests
- [ ] Signup flow with password requirements
- [ ] Login → Dashboard → Upload → View dataset flow
- [ ] Blog creation → Publishing → Viewing flow

---

## Implementation Order Summary

**Week 1 - Critical Security (Must Do)**:
1. MongoDB credentials (1.1)
2. JWT secret (1.2)
3. Dataset authorization (1.3)
4. CORS configuration (1.5)
5. Token validation (1.6)

**Week 2 - Type Safety & Major Bugs**:
6. Remove @ts-ignore (2.1)
7. Fix User schema (2.2)
8. Rate limiting (2.3)
9. Blog post ownership (2.4)

**Week 3 - Code Quality**:
10. Structured logging (3.1)
11. Error handling (3.2)
12. Security headers (3.4)
13. Input validation (2.5)

**Week 4 - Polish & Testing**:
14. Redis decision (1.4)
15. Frontend improvements (4.1, 4.2)
16. Database indexes (3.7)
17. Comprehensive testing (Phase 5)

---

## Critical Files to Modify

**Security (High Priority)**:
- `server/.env`
- `server/src/controllers/authController.ts`
- `server/src/middleware/auth.ts`
- `server/src/controllers/datasetController.ts`
- `server/src/index.ts`
- `client/src/context/AuthContext.tsx`

**Type Safety**:
- `server/src/types/express.d.ts` (create)
- `server/src/models/User.ts`
- All files with @ts-ignore

**Infrastructure**:
- `server/src/config/logger.ts` (create)
- `server/src/utils/errors.ts` (create)
- `server/src/middleware/errorHandler.ts` (create)
- `server/src/middleware/rateLimiter.ts` (create)

**Validation**:
- `server/src/validators/blog.ts` (create)
- `server/src/validators/dataset.ts` (create)

---

## Dependencies to Install

```bash
# Server
npm install express-rate-limit helmet winston express-validator

# No new client dependencies needed
```

---

## Environment Variables to Add

```bash
# server/.env
JWT_SECRET=<generate strong secret>
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

```bash
# client/.env
# No new variables needed
```

---

## Estimated Time: 4 weeks
- Week 1: 12-15 hours (critical security)
- Week 2: 10-12 hours (type safety & bugs)
- Week 3: 8-10 hours (code quality)
- Week 4: 6-8 hours (testing & polish)

**Total: 36-45 hours**

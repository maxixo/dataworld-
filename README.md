# DataWorld Reference Guide

DataWorld is a high-performance analytics and visualization web application. This document provides a quick reference for the available API endpoints and project structure.

## API Documentation

All API routes are prefixed with `/api`.

### Authentication (`/api/auth`)
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/signup` | POST | Register a new user | Public |
| `/login` | POST | Authenticate user & get token | Public |

### Datasets (`/api/datasets`)
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/` | POST | Upload a new CSV dataset | Private (User) |
| `/` | GET | List all datasets for current user | Private (User) |
| `/history` | GET | View file upload history | Private (User) |
| `/:id` | GET | Fetch full data for a specific dataset | Private (User) |

### Blog (`/api/blog`)
| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/` | GET | Get all published posts | Public |
| `/:id` | GET | Get single post details | Public |
| `/user/drafts` | GET | Get your own draft posts | Private (User) |
| `/admin/all` | GET | View all posts including drafts | Private (Admin) |
| `/` | POST | Create a new blog post | Private (Admin) |
| `/:id` | PUT | Update an existing post | Private (Admin) |
| `/:id` | DELETE | Remove a blog post | Private (Admin) |

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Atlas)
- **Caching**: Redis (ioredis)

---
*Note: For detailed setup instructions, please refer to [BLOG_SETUP.md](./BLOG_SETUP.md).*

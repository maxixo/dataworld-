# Adding Sample Blog Posts to DataWorld

This guide explains how to add the sample 2025 technology news blog posts to your DataWorld application.

## Option 1: Using the Admin Dashboard (Recommended)

1. **Start the application**:
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

2. **Create an admin account**:
   - Add your email to `server/.env`:
     ```
     ADMIN_EMAILS=youremail@example.com
     ```
   - Sign up at `http://localhost:5173/signup` with that email
   - You'll automatically get admin access

3. **Access the admin dashboard**:
   - Navigate to `http://localhost:5173/admin`
   - Click "New Post" button

4. **Copy content from sample posts**:
   - Open `client/src/data/sampleBlogPosts.ts`
   - Copy the title, content, category, and tags from any post
   - Paste into the blog editor form
   - Check "Publish immediately"
   - Click "Create Post"

5. **Repeat for all 8 sample posts** or create your own!

## Option 2: Direct API Import (Advanced)

If you want to bulk import all sample posts programmatically:

1. **Create an import script** (`server/src/scripts/importBlogPosts.ts`):

```typescript
import mongoose from 'mongoose';
import { BlogPost } from '../models/BlogPost';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const samplePosts = [
  // Copy the blogPosts array from client/src/data/sampleBlogPosts.ts
];

async function importPosts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dataworld');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin account first.');
      process.exit(1);
    }

    // Import posts
    for (const postData of samplePosts) {
      const post = new BlogPost({
        ...postData,
        author: adminUser._id
      });
      await post.save();
      console.log(`Created: ${post.title}`);
    }

    console.log('\\nAll posts imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importPosts();
```

2. **Run the import script**:
   ```bash
   cd server
   npx ts-node src/scripts/importBlogPosts.ts
   ```

## Sample Blog Posts Included

The sample data includes 8 comprehensive technology news articles for 2025:

1. **AI Agents Transform Enterprise Workflows** - Artificial Intelligence
2. **Quantum Computing Achieves Commercial Breakthrough** - Quantum Computing
3. **The Rise of Ambient Computing** - Internet of Things
4. **Sustainable Tech: Green Data Centers** - Sustainability
5. **Web3 and Decentralization: Beyond the Hype** - Blockchain
6. **Edge AI: Intelligence Moves to the Device** - Artificial Intelligence
7. **Neurotechnology: The Brain-Computer Interface Revolution** - Neurotechnology
8. **5G and Beyond: The Connectivity Revolution** - Telecommunications

Each post includes:
- Engaging title
- 300-500 word content with multiple paragraphs
- Relevant category
- 3-4 descriptive tags
- Published status set to `true`

## Viewing the Blog

Once posts are added:
- Public blog: `http://localhost:5173/blog`
- Individual posts: `http://localhost:5173/blog/:id`
- Admin dashboard: `http://localhost:5173/admin`

## Customizing Content

Feel free to:
- Edit the sample posts to match your brand voice
- Add your own categories and tags
- Include images (future enhancement)
- Adjust content length based on your needs
- Create drafts by setting `published: false`

## Responsive Design

The blog is fully responsive across all screen sizes:
- **Mobile** (< 640px): Single column, optimized text sizes
- **Tablet** (640px - 1024px): 2-column grid
- **Desktop** (> 1024px): 3-column grid with full features

All typography, spacing, and interactive elements adapt automatically.

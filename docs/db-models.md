Co Zostanie Dodane Później (Tydzień 9-10) 📅
Podczas implementacji billing:
javascript// ADDED FIELDS:

currentPlan: String (enum: free, starter, pro)

trial: {
  startedAt: Date,
  endsAt: Date,
  isActive: Boolean
}

subscription: {
  id: String,
  status: String,
  currentPeriodEnd: Date
}

limits: {
  maxPosts: Number,
  maxDrafts: Number
}

features: {
  availableComponents: [String],
  customStyling: Boolean,
  prioritySupport: Boolean
}

// ADDED METHODS:

canCreatePost()
canCreateDraft()
isTrialActive()
hasComponentAccess(type)
updatePlan(newPlan)

Simple Limits (Hardcoded for Now) ⚡
javascript// app/lib/limits.server.js

// Temporary hardcoded limits for development
// Will be replaced with plan-based system later

export const DEV_LIMITS = {
  maxPosts: 999,      // Essentially unlimited for dev
  maxDrafts: 999,
  maxComponents: 999
};

/**
 * Check if shop can create post (dev version)
 */
export function canCreatePost(shop) {
  return shop.usage.postsCount < DEV_LIMITS.maxPosts;
}

/**
 * Check if shop can create draft (dev version)
 */
export function canCreateDraft(shop) {
  return shop.usage.draftsCount < DEV_LIMITS.maxDrafts;
}

/**
 * Check component access (dev version - all allowed)
 */
export function hasComponentAccess(shop, componentType) {
  return true; // All components available during development
}

Usage w Development 📝
1. OAuth - Shop Creation
javascript// app/routes/auth.callback.jsx

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  
  const connection = await connectToMongo();
  
  // Simple shop creation
  const shop = await Shop.findOrCreate({
    shopId: session.shop,  // GID from session
    shopDomain: session.shop.replace('gid://shopify/Shop/', ''),
    shopName: 'Dev Shop', // Można pobrać z Shopify API later
    email: null
  });
  
  console.log('✅ Shop ready:', shop.shopDomain);
  
  return redirect('/app');
}
2. Check Limits Before Action
javascript// app/routes/app.posts.$draftId.publish.jsx

import { canCreatePost } from '~/lib/limits.server';

export async function action({ request, params }) {
  const shop = await Shop.findOne({ shopId });
  
  // Simple check
  if (!canCreatePost(shop)) {
    return {
      error: 'Post limit reached'
      // W production: pokaż upgrade message
    };
  }
  
  // Continue with publish...
}
3. Update Counters
javascript// After successful publish:

await Shop.updateOne(
  { shopId },
  {
    $inc: {
      'usage.postsCount': 1,
      'usage.draftsCount': -1
    }
  }
);

Migration Strategy (Tydzień 9-10) 🔄
Krok 1: Dodaj nowe fields (compatible)
javascript// BEFORE (week 1-8):
Shop {
  shopId,
  shopDomain,
  usage: { postsCount, draftsCount }
}

// AFTER (week 9):
Shop {
  shopId,
  shopDomain,
  usage: { postsCount, draftsCount },
  
  // NEW FIELDS (with defaults):
  currentPlan: { default: 'free' },
  trial: { default: {...} },
  limits: { default: {...} }
}
Nie wymaga migracji existing shops! Mongoose ustawi defaults automatycznie.

Krok 2: Replace hardcoded limits
javascript// BEFORE (dev):
import { canCreatePost } from '~/lib/limits.server';

if (!canCreatePost(shop)) { ... }

// AFTER (production):
if (!shop.canCreatePost()) { ... }
// Method jest w Shop model

Krok 3: Add billing UI
javascript// New routes:
/app/billing          // Pricing page
/app/billing/upgrade  // Upgrade flow
/app/billing/cancel   // Cancellation

Benefits of Simple Model Now ✅
javascript✅ Faster development (mniej complexity)
✅ Focus na core features (editor, components)
✅ Easy to test (no billing logic to mock)
✅ Clean codebase (no unused fields)
✅ Flexible pricing (jeszcze nie decided)
✅ Easy migration later (add fields, keep compatibility)

Minimal Implementation Checklist 📋
Week 1-2 (Foundation):
javascript✅ Shop model (minimal)
✅ Shop.findOrCreate() (OAuth)
✅ Simple counters (postsCount, draftsCount)
✅ Basic settings (defaultBlog, defaultAuthor)
Week 3-8 (Core Features):
javascript✅ Draft creation/editing
✅ Publish flow (Draft → PublishedPost)
✅ Edit flow (PublishedPost auto-save)
✅ Components (product-card, gallery, etc.)
✅ Counter updates (increment/decrement)
✅ Hardcoded limits check (999 for dev)
Week 9-10 (Billing):
javascript🔄 Add billing fields to Shop model
🔄 Implement Shopify Billing API
🔄 Add plan-based limits
🔄 Add trial tracking
🔄 Replace hardcoded limits with shop.canCreatePost()
🔄 Add upgrade UI

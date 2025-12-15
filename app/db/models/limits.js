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
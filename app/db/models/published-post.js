// app/db/models/published-post.server.js

import mongoose from 'mongoose';

const publishedPostSchema = new mongoose.Schema({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDENTITY (immutable after publish)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  articleId: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Shopify Article GID
    // Example: "gid://shopify/Article/123456789"
    // PRIMARY KEY
  },
  
  shopId: {
    type: String,
    required: true,
    index: true
    // Owner shop GID
    // Example: "gid://shopify/Shop/87158849801"
  },
  
  originalDraftId: {
    type: String
    // Link back to original draft (tracking only)
    // Example: "draft_1704117600_abc123"
  },
  
  handle: {
    type: String,
    required: true,
    index: true
    // URL slug (IMMUTABLE!)
    // Set by Shopify on create, cannot be changed
    // Example: "10-best-watches" or "10-best-watches-1"
  },
  
  blogId: {
    type: String,
    required: true,
    index: true
    // Blog GID (IMMUTABLE!)
    // Cannot move article between blogs
    // Example: "gid://shopify/Blog/456"
  },
  
  blogHandle: {
    type: String,
    required: true
    // Blog handle (IMMUTABLE!)
    // Example: "news"
  },
  
  publishedAt: {
    type: Date,
    required: true
    // Timestamp of first publish (IMMUTABLE!)
    // From Shopify Article.publishedAt
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CURRENT VERSION (working copy - editable)
  // = What merchant is editing NOW
  // = Updated by auto-save every 2 seconds
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  title: {
    type: String,
    required: true
    // Article title
  },
  
  author: {
    type: String
    // Article author
  },
  
  tags: [{
    type: String
    // Article tags
  }],
  
  seoTitle: {
    type: String
    // Custom SEO title (meta title)
  },
  
  seoDescription: {
    type: String
    // Meta description
  },
  
  coverImage: {
    url: String,
    altText: String,
    width: Number,
    height: Number
  },
  
  content: {
    tiptap: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    richHtml: {
      type: String,
      required: true
    },
    cleanHtml: {
      type: String,
      required: true
    }
  },
  
  components: [{
    id: String,
    type: String,
    config: mongoose.Schema.Types.Mixed,
    position: Number
  }],
  
  lastEditedAt: {
    type: Date
    // Timestamp of last edit (auto-save)
    // Updated every 2 seconds during editing
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAST SYNCED VERSION (backup copy - read-only)
  // = What is LIVE on Shopify storefront
  // = Point of restore for "Discard Changes"
  // = Updated ONLY when merchant clicks "Publish Changes"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  lastSyncedTitle: {
    type: String,
    required: true
    // Backup of title
  },
  
  lastSyncedAuthor: {
    type: String
    // Backup of author
  },
  
  lastSyncedTags: [{
    type: String
    // Backup of tags
  }],
  
  lastSyncedSeoTitle: {
    type: String
    // Backup of SEO title
  },
  
  lastSyncedSeoDescription: {
    type: String
    // Backup of SEO description
  },
  
  lastSyncedCoverImage: {
    url: String,
    altText: String,
    width: Number,
    height: Number
    // Backup of cover image
  },
  
  lastSyncedContent: {
    tiptap: {
      type: mongoose.Schema.Types.Mixed,
      required: true
      // Backup of Tiptap JSON
    },
    richHtml: {
      type: String,
      required: true
      // Backup of rich HTML
    },
    cleanHtml: {
      type: String,
      required: true
      // Backup of clean HTML
    }
  },
  
  lastSyncedComponents: [{
    id: String,
    type: String,
    config: mongoose.Schema.Types.Mixed,
    position: Number
    // Backup of components config
  }],
  
  lastSyncedAt: {
    type: Date,
    required: true,
    default: Date.now
    // Timestamp of last sync to Shopify
    // Updates ONLY when merchant clicks "Publish Changes"
    // NOT updated by auto-save!
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  status: {
    type: String,
    enum: ['published', 'updating'],
    default: 'published'
    // 'published' = normal state (can edit)
    // 'updating' = sync in progress (show spinner)
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SHOPIFY METADATA (cached from Shopify response)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  shopifyData: {
    url: {
      type: String
      // Full storefront URL
      // Example: "https://shop.com/blogs/news/10-best-watches"
      // From Article.onlineStoreUrl
    }
  }
  
}, {
  timestamps: true
  // Auto-adds: createdAt, updatedAt
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDEXES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

publishedPostSchema.index({ shopId: 1, publishedAt: -1 });
publishedPostSchema.index({ shopId: 1, status: 1 });
publishedPostSchema.index({ blogId: 1 });
publishedPostSchema.index({ handle: 1 });


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSTANCE METHODS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

publishedPostSchema.methods = {
  /**
   * Update working content (auto-save)
   * Does NOT change lastSynced* fields!
   */
  async updateContent(data) {
    // Update current version
    this.title = data.title;
    this.author = data.author;
    this.tags = data.tags;
    this.seoTitle = data.seoTitle;
    this.seoDescription = data.seoDescription;
    this.coverImage = data.coverImage;
    this.content.tiptap = data.content.tiptap;
    this.content.richHtml = data.content.richHtml;
    this.content.cleanHtml = data.content.cleanHtml;
    this.components = data.components;
    this.lastEditedAt = new Date();
    
    // lastSynced* fields UNCHANGED!
    
    await this.save();
  },
  
  /**
   * Sync to Shopify and create backup
   * Updates lastSynced* fields with current version
   * Updates lastSyncedAt timestamp
   */
  async syncToShopify() {
    // Create full backup from current version
    this.lastSyncedTitle = this.title;
    this.lastSyncedAuthor = this.author;
    this.lastSyncedTags = [...this.tags];
    this.lastSyncedSeoTitle = this.seoTitle;
    this.lastSyncedSeoDescription = this.seoDescription;
    this.lastSyncedCoverImage = this.coverImage ? {
      url: this.coverImage.url,
      altText: this.coverImage.altText,
      width: this.coverImage.width,
      height: this.coverImage.height
    } : null;
    
    this.lastSyncedContent = {
      tiptap: this.content.tiptap,
      richHtml: this.content.richHtml,
      cleanHtml: this.content.cleanHtml
    };
    
    this.lastSyncedComponents = this.components.map(c => ({
      id: c.id,
      type: c.type,
      config: c.config,
      position: c.position
    }));
    
    this.lastSyncedAt = new Date();
    
    await this.save();
  },
  
  /**
   * Check if there are unpublished changes
   */
  hasUnpublishedChanges() {
    if (!this.lastEditedAt) return false;
    return this.lastEditedAt > this.lastSyncedAt;
  },
  
  /**
   * Discard changes - restore from lastSynced
   * Reverts current version to lastSynced version
   */
  async discardChanges() {
    // Restore full snapshot from lastSynced
    this.title = this.lastSyncedTitle;
    this.author = this.lastSyncedAuthor;
    this.tags = [...this.lastSyncedTags];
    this.seoTitle = this.lastSyncedSeoTitle;
    this.seoDescription = this.lastSyncedSeoDescription;
    this.coverImage = this.lastSyncedCoverImage ? {
      url: this.lastSyncedCoverImage.url,
      altText: this.lastSyncedCoverImage.altText,
      width: this.lastSyncedCoverImage.width,
      height: this.lastSyncedCoverImage.height
    } : null;
    
    this.content = {
      tiptap: this.lastSyncedContent.tiptap,
      richHtml: this.lastSyncedContent.richHtml,
      cleanHtml: this.lastSyncedContent.cleanHtml
    };
    
    this.components = this.lastSyncedComponents.map(c => ({
      id: c.id,
      type: c.type,
      config: c.config,
      position: c.position
    }));
    
    // Reset lastEditedAt to lastSyncedAt
    this.lastEditedAt = this.lastSyncedAt;
    
    await this.save();
  }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC METHODS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

publishedPostSchema.statics = {
  /**
   * Find posts for shop
   */
  async findByShop(shopId, options = {}) {
    const {
      limit = 20,
      skip = 0,
      status = 'published'
    } = options;
    
    return this.find({ shopId, status })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  },
  
  /**
   * Find by Article GID
   */
  async findByArticleId(articleId) {
    return this.findOne({ articleId });
  },
  
  /**
   * Find posts with unpublished changes
   */
  async findWithUnpublishedChanges(shopId) {
    // Find posts where lastEditedAt > lastSyncedAt
    return this.find({
      shopId,
      status: 'published',
      lastEditedAt: { $exists: true },
      $expr: { $gt: ['$lastEditedAt', '$lastSyncedAt'] }
    })
    .sort({ lastEditedAt: -1 })
    .lean();
  }
};

export const PublishedPost = mongoose.models.PublishedPost || mongoose.model('PublishedPost', publishedPostSchema);

/*
import mongoose from 'mongoose'

const publishedPostSchema = new mongoose.Schema(
  {
    // Shop reference
    shopDomain: {
      type: String,
      required: true,
      index: true,
    },
    
    // Shopify Article reference
    articleId: {
      type: String,
      required: true,
      unique: true,
      // Shopify Article ID: "gid://shopify/Article/123456789"
    },
    
    articleHandle: {
      type: String,
      required: true,
    },
    
    blogHandle: {
      type: String,
      required: true,
    },
    
    // Post info (cached from Shopify)
    title: {
      type: String,
      required: true,
    },
    
    author: {
      type: String,
    },
    
    tags: [String],
    
    publishedAt: {
      type: Date,
      required: true,
    },
    
    // Version tracking
    currentVersion: {
      type: Number,
      default: 1,
    },
    
    // Last sync with Shopify
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    
    // Snapshot of last synced content (for change detection)
    lastSyncedContent: {
      type: mongoose.Schema.Types.Mixed,
      // Tiptap JSON snapshot
    },
    
    // Components used (for analytics)
    componentsUsed: [
      {
        type: String,
        count: Number,
      },
    ],
    
    // Statistics
    wordCount: {
      type: Number,
      default: 0,
    },
    
    // Analytics (optional - for future)
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      lastViewedAt: {
        type: Date,
      },
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
publishedPostSchema.index({ shopDomain: 1, publishedAt: -1 })
publishedPostSchema.index({ articleId: 1 })
publishedPostSchema.index({ shopDomain: 1, blogHandle: 1 })

// Instance Methods
publishedPostSchema.methods.markSynced = function (content) {
  this.lastSyncedAt = new Date()
  this.lastSyncedContent = content
  this.currentVersion += 1
  return this.save()
}

// Static Methods
publishedPostSchema.statics.findByShop = function (shopDomain, limit = 50) {
  return this.find({ shopDomain, isActive: true })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean()
}

publishedPostSchema.statics.findByArticleId = function (articleId) {
  return this.findOne({ articleId, isActive: true }).lean()
}

publishedPostSchema.statics.countByShop = function (shopDomain) {
  return this.countDocuments({ shopDomain, isActive: true })
}

publishedPostSchema.statics.getRecentPosts = function (shopDomain, days = 7) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  return this.find({
    shopDomain,
    isActive: true,
    publishedAt: { $gte: cutoffDate },
  })
    .sort({ publishedAt: -1 })
    .lean()
}

// Export model
export const PublishedPost = mongoose.models.PublishedPost || mongoose.model('PublishedPost', publishedPostSchema)

*/
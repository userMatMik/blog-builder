// app/db/models/draft.server.js

import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDENTITY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  draftId: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Example: "draft_1704117600_abc123"
  },
  
  shopId: {
    type: String,
    required: true,
    index: true
    // Example: "gid://shopify/Shop/87158849801"
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASIC METADATA (will become Article fields)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  title: {
    type: String,
    required: true,
    default: 'Untitled Draft'
    // Article title
  },
  
  author: {
    type: String
    // Article author (e.g., "Shop Owner")
  },
  
  blogHandle: {
    type: String
    // Target blog handle (e.g., "news")
    // Will be converted to blogId during publish
  },
  
  tags: [{
    type: String
    // Article tags for SEO and categorization
  }],
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SEO FIELDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  seoTitle: {
    type: String
    // Custom SEO title (meta title)
    // Falls back to title if not provided
    // Max 60 chars recommended
  },
  
  seoDescription: {
    type: String
    // Meta description for search engines
    // Max 160 chars recommended
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COVER IMAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  coverImage: {
    url: {
      type: String
      // Shopify CDN URL or external URL
      // Example: "https://cdn.shopify.com/s/files/1/0001/..."
    },
    altText: {
      type: String
      // Alt text for accessibility and SEO
    },
    width: {
      type: Number
      // Image width in pixels
    },
    height: {
      type: Number
      // Image height in pixels
    }
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONTENT (3 formats)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  content: {
    tiptap: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {
        type: 'doc',
        content: []
      }
      // Tiptap JSON (source of truth for editing)
    },
    
    richHtml: {
      type: String,
      default: ''
      // HTML with web components (for Theme Extension)
    },
    
    cleanHtml: {
      type: String,
      default: ''
      // HTML without web components (fallback)
    }
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMPONENTS CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  components: [{
    id: {
      type: String,
      required: true
      // Component instance ID (e.g., "pc_abc123")
    },
    
    type: {
      type: String,
      required: true,
      enum: [
        'product-card',
        'image-gallery',
        'product-carousel',
        'cta-box',
        'video-embed',
        'faq',
        'shop-the-look',
        'table-of-contents'
      ]
      // Component type
    },
    
    config: {
      type: mongoose.Schema.Types.Mixed
      // Component-specific settings (productId, layout, etc.)
    },
    
    position: {
      type: Number
      // Character position in Tiptap document
    }
  }],
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  status: {
    type: String,
    enum: ['draft', 'ready'],
    default: 'draft'
    // 'draft' = work in progress
    // 'ready' = validation passed, can publish
  },
  
  lastSavedAt: {
    type: Date,
    default: Date.now
    // Auto-save timestamp (updated every 2s)
  }
  
}, {
  timestamps: true
  // Auto-adds: createdAt, updatedAt
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDEXES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

draftSchema.index({ shopId: 1, createdAt: -1 });
draftSchema.index({ shopId: 1, status: 1 });
draftSchema.index({ shopId: 1, updatedAt: -1 });


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSTANCE METHODS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

draftSchema.methods = {
  /**
   * Update content and increment version
   */
  async updateContent(tiptapJson, richHtml, cleanHtml, components) {
    this.content.tiptap = tiptapJson;
    this.content.richHtml = richHtml;
    this.content.cleanHtml = cleanHtml;
    if (components) {
      this.components = components;
    }
    this.lastSavedAt = new Date();
    await this.save();
  }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC METHODS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

draftSchema.statics = {
  /**
   * Generate unique draft ID
   */
  generateDraftId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `draft_${timestamp}_${random}`;
  },
  
  /**
   * Find drafts for shop
   */
  async findByShop(shopId, options = {}) {
    const {
      limit = 20,
      skip = 0,
      status = null
    } = options;
    
    const query = { shopId };
    if (status) query.status = status;
    
    return this.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  }
};

export const Draft = mongoose.models.Draft || mongoose.model('Draft', draftSchema);

/*
/ app/models/draft.server.js

import mongoose from 'mongoose'

const draftSchema = new mongoose.Schema(
  {
    // Shop reference
    shopDomain: {
      type: String,
      required: true,
      index: true,
    },
    
    // Draft ID (unique per draft)
    draftId: {
      type: String,
      required: true,
      unique: true,
      // Format: draft_timestamp_randomstring
      // Example: draft_1704117600_abc123
    },
    
    // Content
    title: {
      type: String,
      default: 'Untitled Draft',
      maxlength: 200,
    },
    
    // Tiptap JSON (full editor state)
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      },
    },
    
    // Components used (for quick filtering)
    components: [
      {
        type: {
          type: String,
          enum: [
            'productCard',
            'gallery',
            'productSlider',
            'faq',
            'cta',
            'shopTheLook',
            'video',
            'toc',
          ],
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
    
    // Metadata
    targetBlog: {
      type: String,
      default: 'news',
    },
    
    author: {
      type: String,
    },
    
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    
    // SEO preview
    seoTitle: {
      type: String,
      maxlength: 70,
    },
    
    seoDescription: {
      type: String,
      maxlength: 160,
    },
    
    // Statistics
    wordCount: {
      type: Number,
      default: 0,
    },
    
    characterCount: {
      type: Number,
      default: 0,
    },
    
    // Auto-save tracking
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    
    autoSaveVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
draftSchema.index({ shopDomain: 1, updatedAt: -1 })
draftSchema.index({ draftId: 1 })

// Instance Methods
draftSchema.methods.updateWordCount = function () {
  // Extract text from Tiptap JSON
  const getText = (node) => {
    if (node.type === 'text') return node.text || ''
    if (node.content) {
      return node.content.map(getText).join(' ')
    }
    return ''
  }
  
  const text = getText(this.content)
  this.wordCount = text.split(/\s+/).filter(Boolean).length
  this.characterCount = text.length
}

draftSchema.methods.extractComponents = function () {
  const components = new Map()
  
  const traverse = (node) => {
    if (node.type && node.type !== 'doc' && node.type !== 'paragraph' && node.type !== 'text') {
      const count = components.get(node.type) || 0
      components.set(node.type, count + 1)
    }
    
    if (node.content) {
      node.content.forEach(traverse)
    }
  }
  
  traverse(this.content)
  
  this.components = Array.from(components.entries()).map(([type, count]) => ({
    type,
    count,
  }))
}

// Pre-save hook
draftSchema.pre('save', function (next) {
  this.updateWordCount()
  this.extractComponents()
  this.lastSavedAt = new Date()
  this.autoSaveVersion += 1
  next()
})

// Static Methods
draftSchema.statics.findByShop = function (shopDomain, limit = 20) {
  return this.find({ shopDomain })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean()
}

draftSchema.statics.findByDraftId = function (draftId) {
  return this.findOne({ draftId }).lean()
}

draftSchema.statics.deleteOldDrafts = async function (daysOld = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const result = await this.deleteMany({
    updatedAt: { $lt: cutoffDate },
  })
  
  console.log(`🗑️ Deleted ${result.deletedCount} old drafts`)
  return result
}

// Export model
export const Draft = mongoose.models.Draft || mongoose.model('Draft', draftSchema)

*/

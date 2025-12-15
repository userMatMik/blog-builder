import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IDENTITY (immutable)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  shopId: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Example: "gid://shopify/Shop/87158849801"
  },
  
  shopDomain: {
    type: String,
    required: true,
    index: true
    // Example: "kttnstore.myshopify.com"
  },
  
  shopName: {
    type: String
    // Example: "Kttn Store"
  },
  
  email: {
    type: String
    // Shop owner email
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // USAGE TRACKING (simple counters)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  usage: {
    postsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    draftsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETTINGS (global defaults)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  settings: {
    defaultBlog: {
      type: String,
      default: 'news'
      // Default blog handle for new posts
    },
    
    defaultAuthor: {
      type: String
      // Default author name (fallback to shopName if not set)
    },
    
    autoSave: {
      type: Boolean,
      default: true
    },
    
    autoSaveInterval: {
      type: Number,
      default: 2000,
      min: 1000
      // Milliseconds (1-10 seconds)
    }
  },
  
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LIFECYCLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  installedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  uninstalledAt: {
    type: Date,
    default: null
  }
  
}, {
  timestamps: true
  // Adds: createdAt, updatedAt
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDEXES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

shopSchema.index({ shopDomain: 1 });
shopSchema.index({ installedAt: -1 });


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INSTANCE METHODS (minimal for now)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

shopSchema.methods = {
  /**
   * Update last active timestamp
   */
  async touchLastActive() {
    this.lastActiveAt = new Date();
    await this.save();
  },
  
  /**
   * Get default author (fallback to shop name)
   */
  getDefaultAuthor() {
    return this.settings.defaultAuthor || this.shopName || 'Shop Owner';
  }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STATIC METHODS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

shopSchema.statics = {
  /**
   * Find or create shop (called on OAuth)
   */
  async findOrCreate(shopData) {
    let shop = await this.findOne({ shopId: shopData.shopId });
    
    if (!shop) {
      shop = await this.create({
        shopId: shopData.shopId,
        shopDomain: shopData.shopDomain,
        shopName: shopData.shopName,
        email: shopData.email,
        settings: {
          defaultBlog: 'news',
          defaultAuthor: shopData.shopName || 'Shop Owner'
        }
      });
      
      console.log('✅ New shop created:', shopData.shopDomain);
      
    } else {
      // Update shop info
      shop.shopDomain = shopData.shopDomain;
      shop.shopName = shopData.shopName || shop.shopName;
      shop.email = shopData.email || shop.email;
      shop.lastActiveAt = new Date();
      
      // Reinstall handling
      if (shop.uninstalledAt) {
        shop.uninstalledAt = null;
        console.log('✅ Shop reinstalled:', shopData.shopDomain);
      }
      
      await shop.save();
    }
    
    return shop;
  }
};

export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
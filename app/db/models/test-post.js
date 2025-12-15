// app/models/test-post.server.js

import mongoose from 'mongoose';

const testPostSchema = new mongoose.Schema({
  // Shopify Shop GID (zawsze!)
  shopId: {
    type: String,
    required: true,
    index: true
  },
  
  // Simple test fields
  title: {
    type: String,
    required: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  // Auto timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // Adds createdAt & updatedAt
});

// Index dla queries
testPostSchema.index({ shopId: 1, createdAt: -1 });

// Export model (Mongoose singleton pattern)
export const TestPost = mongoose.models.TestPost || mongoose.model('TestPost', testPostSchema);
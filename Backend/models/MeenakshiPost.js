const mongoose = require('mongoose');

/**
 * Blog / articles — the organic-search vehicle in the proposal.
 *
 * `body` is markdown-ish plain text split on blank lines by the frontend, which
 * keeps the editor simple and avoids shipping an HTML sanitiser for content
 * only ever authored by the site owner.
 */
const meenakshiPostSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 250 },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug may contain lowercase letters, numbers and hyphens only']
  },
  excerpt: { type: String, default: '', trim: true, maxlength: 500 },
  body: { type: String, default: '', trim: true },

  cover: { type: String, default: '' },
  coverAlt: { type: String, default: '' },

  tags: { type: [String], default: [] },
  author: { type: String, default: 'Meenakshi', trim: true },

  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date, default: null },

  seoTitle: { type: String, default: '', trim: true, maxlength: 200 },
  seoDescription: { type: String, default: '', trim: true, maxlength: 400 },

  readMinutes: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Stamp publishedAt the first time a post goes live, and estimate reading time.
meenakshiPostSchema.pre('save', function (next) {
  if (this.isPublished && !this.publishedAt) this.publishedAt = new Date();
  if (!this.isPublished) this.publishedAt = null;

  const words = String(this.body || '').trim().split(/\s+/).filter(Boolean).length;
  this.readMinutes = Math.max(1, Math.round(words / 200));
  next();
});

meenakshiPostSchema.index({ isPublished: 1, publishedAt: -1 });

module.exports = mongoose.model('MeenakshiPost', meenakshiPostSchema);

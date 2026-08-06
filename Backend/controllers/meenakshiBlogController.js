/**
 * Blog / articles.
 *
 * Public reads only ever return published posts — a draft must never be
 * reachable by guessing its slug.
 */

const MeenakshiPost = require('../models/MeenakshiPost');
const { invalidate } = require('./meenakshiContentController');

const publicFields = 'title slug excerpt cover coverAlt tags author publishedAt readMinutes seoTitle seoDescription';

/** GET /api/blog — public. Published posts, newest first. */
const listPosts = async (req, res) => {
  try {
    const { tag, limit = 50 } = req.query;
    const query = { isPublished: true };
    if (tag) query.tags = tag;

    const posts = await MeenakshiPost.find(query)
      .select(publicFields)
      .sort({ publishedAt: -1 })
      .limit(Math.min(Number(limit) || 50, 100))
      .lean();

    const tags = await MeenakshiPost.distinct('tags', { isPublished: true });
    res.json({ success: true, count: posts.length, tags: tags.filter(Boolean), data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** GET /api/blog/:slug — public. */
const getPost = async (req, res) => {
  try {
    const post = await MeenakshiPost.findOne({ slug: req.params.slug, isPublished: true }).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const related = await MeenakshiPost.find({
      isPublished: true,
      _id: { $ne: post._id },
      ...(post.tags?.length ? { tags: { $in: post.tags } } : {})
    }).select(publicFields).sort({ publishedAt: -1 }).limit(3).lean();

    res.json({ success: true, data: post, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ---- admin --------------------------------------------------------------- */

const listAll = async (req, res) => {
  try {
    const data = await MeenakshiPost.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const post = await MeenakshiPost.create(req.body);
    invalidate();
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A post with that slug already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    // Use save() rather than findByIdAndUpdate so the pre-save hook runs and
    // publishedAt / readMinutes stay correct.
    const post = await MeenakshiPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });

    Object.entries(req.body).forEach(([k, v]) => {
      if (k !== '_id' && k !== '__v') post[k] = v;
    });
    await post.save();
    invalidate();
    res.json({ success: true, data: post });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A post with that slug already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await MeenakshiPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    invalidate();
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listPosts, getPost, listAll, createPost, updatePost, deletePost };

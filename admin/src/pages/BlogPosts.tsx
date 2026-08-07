import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, Plus, Edit2, Trash2, X, Save, AlertCircle, Search, Eye, EyeOff, ExternalLink,
} from 'lucide-react'
import AdminShell from '../components/AdminShell'
import * as ui from '../utils/ui'
import { listPosts, createPost, updatePost, deletePost } from '../utils/meenakshiApi'



const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)

const empty = {
  title: '', slug: '', excerpt: '', body: '', cover: '', coverAlt: '',
  tags: [] as string[], author: 'Meenakshi', isPublished: false,
  seoTitle: '', seoDescription: '',
}

const BlogPosts = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await listPosts()
      setPosts(res.data || [])
    } catch (e: any) {
      setError(e.message || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setTagInput(''); setShowModal(true) }
  const openEdit = (p: any) => {
    setEditing(p)
    setForm({ ...empty, ...p })
    setTagInput((p.tags || []).join(', '))
    setShowModal(true)
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
      }
      if (editing) await updatePost(editing._id, payload)
      else await createPost(payload)
      setShowModal(false)
      await load()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: any) => {
    if (!window.confirm(`Delete “${p.title}”? This cannot be undone.`)) return
    try { await deletePost(p._id); await load() } catch (e: any) { setError(e.message) }
  }

  const togglePublish = async (p: any) => {
    try { await updatePost(p._id, { isPublished: !p.isPublished }); await load() } catch (e: any) { setError(e.message) }
  }

  const visible = posts.filter((p) =>
    !search.trim() || JSON.stringify(p).toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminShell
      title="Blog"
      subtitle="Articles for organic search reach"
      actions={<button onClick={openCreate} className={ui.btnPrimary}><Plus className="w-4 h-4" /><span className="hidden sm:inline">New post</span></button>}
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-[10px] bg-[rgba(179,66,26,0.07)] border border-[rgba(179,66,26,0.22)] text-[13px] text-[#8e3411]">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="mb-4 relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className={`${ui.input} pl-9`} placeholder="Search posts…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500">No posts yet.</p>
          <p className="text-xs text-slate-400 mt-1">Articles appear on /blog once published.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[10px] border border-[var(--hairline)] overflow-hidden">
          {visible.map((p, i) => (
            <div key={p._id} className={`flex items-start gap-3 px-4 py-3 ${i ? 'border-t border-[var(--hairline)]' : ''} ${p.isPublished ? '' : 'opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">{p.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    p.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-[var(--hairline)]'
                  }`}>
                    {p.isPublished ? 'published' : 'draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.excerpt || p.body?.slice(0, 120)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  /blog/{p.slug} · {p.readMinutes || 1} min read
                  {p.tags?.length ? ` · ${p.tags.join(', ')}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {p.isPublished && (
                  <a href={`http://localhost:5173/blog/${p.slug}`} target="_blank" rel="noreferrer"
                    className="p-2 rounded-[10px] text-slate-400 hover:bg-slate-100 transition" title="View on site">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button onClick={() => togglePublish(p)} className="p-2 rounded-[10px] text-slate-400 hover:bg-slate-100 transition"
                  title={p.isPublished ? 'Unpublish' : 'Publish'}>
                  {p.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 rounded-[10px] text-slate-500 hover:bg-slate-100 transition" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => remove(p)} className="p-2 rounded-[10px] text-red-500 hover:bg-red-50 transition" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[80] bg-[rgba(36,26,20,0.42)] flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[10px] w-full max-w-3xl my-8 shadow-[0_18px_50px_rgba(36,26,20,0.16)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--hairline)] sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-[19px] text-[var(--ink)]" style={ui.displayFace}>{editing ? 'Edit post' : 'New post'}</h2>
              <button onClick={() => setShowModal(false)} className={ui.btnIcon} aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input className={ui.input} value={form.title}
                  onChange={(e) => {
                    const title = e.target.value
                    // Auto-slug only while creating; changing a live slug breaks links.
                    setForm((f: any) => ({ ...f, title, slug: editing ? f.slug : slugify(title) }))
                  }} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input className={ui.input} value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
                <p className="text-xs text-slate-400 mt-1">
                  /blog/{form.slug || 'your-post'}{editing ? ' — changing this breaks existing links.' : ''}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
                <textarea className={ui.input} rows={2} value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1">Shown on the blog index.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                <textarea className={`${ui.input} font-mono text-[13px]`} rows={14} value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })} />
                <p className="text-xs text-slate-400 mt-1">
                  Plain text. Leave a blank line between paragraphs. A line starting with “## ” becomes a heading.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cover image path</label>
                  <input className={ui.input} value={form.cover} placeholder="/img/blog-something.jpg"
                    onChange={(e) => setForm({ ...form, cover: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cover alt text</label>
                  <input className={ui.input} value={form.coverAlt}
                    onChange={(e) => setForm({ ...form, coverAlt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                  <input className={ui.input} value={tagInput} placeholder="astrology, numerology"
                    onChange={(e) => setTagInput(e.target.value)} />
                  <p className="text-xs text-slate-400 mt-1">Comma separated.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Author</label>
                  <input className={ui.input} value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
              </div>

              <details className="border border-[var(--hairline)] rounded-[10px] p-3">
                <summary className="text-sm font-medium text-slate-700 cursor-pointer">SEO</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">SEO title</label>
                    <input className={ui.input} value={form.seoTitle}
                      onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
                    <p className="text-xs text-slate-400 mt-1">Falls back to the post title.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">SEO description</label>
                    <textarea className={ui.input} rows={2} value={form.seoDescription}
                      onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
                    <p className="text-xs text-slate-400 mt-1">Falls back to the excerpt.</p>
                  </div>
                </div>
              </details>

              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="w-4 h-4 accent-[#d4531d]" checked={Boolean(form.isPublished)}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                Published — visible on the site
              </label>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[var(--hairline)]">
              <button onClick={() => setShowModal(false)} className={ui.btnQuiet}>Cancel</button>
              <button onClick={save} disabled={saving || !form.title} className={ui.btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

export default BlogPosts

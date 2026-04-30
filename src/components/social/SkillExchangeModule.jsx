import React, { useState, useCallback } from 'react';
import { Avatar, TalentBadge, formatTime, Modal } from '../Layout';
import { socialAPI } from '../../services/socialAPI';

/* ─── Tag pill ─── */
function TagPill({ label, variant = 'offer' }) {
  const colors = {
    offer: { bg: 'rgba(0,255,179,0.1)', color: 'var(--success)', border: 'rgba(0,255,179,0.2)' },
    need:  { bg: 'rgba(157,217,253,0.1)', color: 'var(--accent)', border: 'rgba(157,217,253,0.2)' },
  };
  const c = colors[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      marginRight: 4, marginBottom: 4,
    }}>{label}</span>
  );
}

/* ─── Comments panel ─── */
function CommentsPanel({ postId, initialCount }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (loaded) { setOpen(v => !v); return; }
    try {
      const res = await socialAPI.getComments(postId);
      setComments(res.data.comments || []);
      setLoaded(true);
      setOpen(true);
    } catch { /* ignore */ }
  }, [postId, loaded]);

  const submit = async () => {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      const res = await socialAPI.addComment(postId, draft.trim());
      setComments(prev => [...prev, res.data.comment]);
      setDraft('');
    } catch { /* ignore */ }
    finally { setPosting(false); }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button className="btn btn-ghost2 btn-sm" onClick={load} style={{ fontSize: 12 }}>
        💬 {open ? 'Hide' : 'Show'} comments ({loaded ? comments.length : initialCount})
      </button>
      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', marginBottom: 12 }}>
            {comments.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No comments yet.</div>
            )}
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 10 }}>
                <Avatar user={c} size={28} />
                <div style={{
                  background: 'var(--bg-glass)', borderRadius: 'var(--radius)',
                  padding: '8px 12px', flex: 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-mid)' }}>{c.name}</span>
                    <TalentBadge talent={c.primary_talent} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatTime(c.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{c.content}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="Write a comment…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
              style={{ flex: 1, fontSize: 13 }}
            />
            <button className="btn btn-primary btn-sm" onClick={submit} disabled={posting || !draft.trim()}>
              {posting ? '…' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Skill exchange card ─── */
function SkillExchangeCard({ post, onLikeToggle, onDeleted }) {
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCollab, setShowCollab] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await socialAPI.toggleLike(post.id);
      onLikeToggle(post.id, res.data.liked, res.data.like_count);
    } catch { /* ignore */ }
    finally { setLiking(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to take down this post?')) return;
    setDeleting(true);
    try {
      await socialAPI.deletePost(post.id);
      onDeleted(post.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16, overflow: 'hidden', padding: 0 }}>

        {/* Header stripe */}
        <div style={{
          padding: '10px 18px',
          background: 'rgba(0,255,179,0.05)',
          borderBottom: '1px solid rgba(0,255,179,0.1)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>🔁</span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--success)' }}>
            Skill Exchange
          </span>
          {post.collab_goal && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
              · {post.collab_goal}
            </span>
          )}
        </div>

        <div style={{ padding: '16px 18px' }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Avatar user={post.author} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-mid)' }}>{post.author?.name}</span>
                <TalentBadge talent={post.author?.primary_talent} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(post.created_at)}</div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6 }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>
              {post.description}
            </p>
          )}

          {/* Offer ↔ Need exchange visual */}
          {(post.skills_offered?.length > 0 || post.skills_needed?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              {post.skills_offered?.length > 0 ? (
                <div style={{
                  background: 'rgba(0,255,179,0.05)', borderRadius: 'var(--radius)',
                  padding: '10px 12px', border: '1px solid rgba(0,255,179,0.12)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', marginBottom: 6, letterSpacing: '0.8px' }}>✦ I CAN OFFER</div>
                  <div>{post.skills_offered.map(s => <TagPill key={s} label={s} variant="offer" />)}</div>
                </div>
              ) : <div />}

              <div style={{ fontSize: 18, textAlign: 'center', color: 'var(--text-muted)', userSelect: 'none' }}>⇄</div>

              {post.skills_needed?.length > 0 ? (
                <div style={{
                  background: 'rgba(157,217,253,0.05)', borderRadius: 'var(--radius)',
                  padding: '10px 12px', border: '1px solid rgba(157,217,253,0.12)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, letterSpacing: '0.8px' }}>◈ I NEED</div>
                  <div>{post.skills_needed.map(s => <TagPill key={s} label={s} variant="need" />)}</div>
                </div>
              ) : <div />}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleLike}
              disabled={liking}
              style={{ color: post.liked_by_me ? '#ff6b9d' : 'var(--text-muted)', gap: 5 }}
            >
              {post.liked_by_me ? '❤️' : '🤍'} {post.like_count}
            </button>
            {!post.is_mine && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowCollab(true)}>
                🤝 Collaborate
              </button>
            )}
            {post.is_mine && (
              <button
                className="btn btn-danger btn-sm"
                style={{ marginLeft: 'auto' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Removing…' : '🗑 Take Down'}
              </button>
            )}
          </div>

          <CommentsPanel postId={post.id} initialCount={post.comment_count} />
        </div>
      </div>

      <Modal isOpen={showCollab} onClose={() => setShowCollab(false)} title="Send Collaboration Request">
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          To collaborate with <strong>{post.author?.name}</strong>, send them a direct message via the Messages page and reference this post.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowCollab(false)}>Close</button>
        </div>
      </Modal>
    </>
  );
}

/* ─── Create form ─── */
function CreateSkillExchangeForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', skills_offered: '', skills_needed: '', collab_goal: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toArray = str => str.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await socialAPI.createPost({
        type: 'skill_exchange',
        title: form.title,
        description: form.description || null,
        skills_offered: toArray(form.skills_offered),
        skills_needed: toArray(form.skills_needed),
        collab_goal: form.collab_goal || null,
      });
      onCreated(res.data.post);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Post title *</label>
        <input className="form-input" placeholder="I can design UI, need backend help"
          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Details</label>
        <textarea className="form-textarea" placeholder="Tell people more about what you're working on…"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          style={{ minHeight: 80 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Skills I can offer</label>
          <input className="form-input" placeholder="Figma, UI Design, Branding"
            value={form.skills_offered} onChange={e => setForm(f => ({ ...f, skills_offered: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Skills I need</label>
          <input className="form-input" placeholder="Node.js, API Design"
            value={form.skills_needed} onChange={e => setForm(f => ({ ...f, skills_needed: e.target.value }))} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Collaboration goal (optional)</label>
        <input className="form-input" placeholder="Build an MVP together for a hackathon"
          value={form.collab_goal} onChange={e => setForm(f => ({ ...f, collab_goal: e.target.value }))} />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost2 btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting…' : '🔁 Post Exchange'}
        </button>
      </div>
    </div>
  );
}

export default function SkillExchangeModule({ posts, onPostCreated, onPostsUpdate }) {
  const [showCreate, setShowCreate] = useState(false);

  const handleLikeToggle = (postId, liked, likeCount) => {
    onPostsUpdate(prev => prev.map(p =>
      p.id === postId ? { ...p, liked_by_me: liked, like_count: likeCount } : p
    ));
  };

  const handleDeleted = (postId) => {
    onPostsUpdate(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div>
      {/* Module header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 24, padding: '16px 20px',
        background: 'rgba(0,255,179,0.04)',
        border: '1px solid rgba(0,255,179,0.1)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ fontSize: 32 }}>🔁</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-mid)' }}>
            Skill Exchange
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} · Offer skills, find collaborators
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ Cancel' : '+ Post Exchange'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-mid)', marginBottom: 16 }}>
            🔁 New Skill Exchange Post
          </div>
          <CreateSkillExchangeForm
            onCreated={(post) => { onPostCreated(post); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {posts.length === 0 && !showCreate && (
        <div className="empty-state">
          <div className="empty-state-icon">🔁</div>
          <div className="empty-state-text">No skill exchange posts yet.<br />Offer your skills and find collaborators!</div>
        </div>
      )}

      {posts.map(post => (
        <SkillExchangeCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
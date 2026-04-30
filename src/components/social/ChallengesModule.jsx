import React, { useState, useCallback } from 'react';
import { Avatar, TalentBadge, formatTime, Modal } from '../Layout';
import { socialAPI } from '../../services/socialAPI';

/* ─── Submissions panel ─── */
function SubmissionsPanel({ postId, postUserId, currentUserId, iSubmitted, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [subs, setSubs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [submitForm, setSubmitForm] = useState('');
  const [posting, setPosting] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [myVotes, setMyVotes] = useState(new Set());

  const load = useCallback(async () => {
    if (loaded) { setOpen(v => !v); return; }
    try {
      const res = await socialAPI.getSubmissions(postId);
      setSubs(res.data.submissions || []);
      setLoaded(true);
      setOpen(true);
    } catch { /* ignore */ }
  }, [postId, loaded]);

  const handleSubmit = async () => {
    if (!submitForm.trim()) return;
    setPosting(true);
    try {
      await socialAPI.submitChallenge(postId, submitForm.trim());
      onSubmitted();
      const res = await socialAPI.getSubmissions(postId);
      setSubs(res.data.submissions || []);
      setSubmitForm('');
      setOpen(true); setLoaded(true);
    } catch { /* ignore */ }
    finally { setPosting(false); }
  };

  const handleVote = async (subId) => {
    if (myVotes.has(subId)) return;
    setVotingId(subId);
    try {
      await socialAPI.voteSubmission(postId, subId);
      setSubs(prev => prev.map(s => s.id === subId ? { ...s, vote_count: s.vote_count + 1 } : s));
      setMyVotes(prev => new Set([...prev, subId]));
    } catch { /* ignore */ }
    finally { setVotingId(null); }
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: 'rgba(255,215,0,0.04)',
        border: '1px solid rgba(255,215,0,0.12)',
        borderRadius: 'var(--radius)',
      }}>
        <button className="btn btn-ghost2 btn-sm" onClick={load} style={{ fontSize: 12, gap: 6 }}>
          🏆 {open ? 'Hide' : 'View'} Leaderboard ({loaded ? subs.length : '…'} entries)
        </button>
        {!iSubmitted && currentUserId !== postUserId && (
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', fontSize: 12 }}
            onClick={() => { setOpen(true); setLoaded(true); }}>
            + Submit Entry
          </button>
        )}
        {iSubmitted && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>
            ✓ Entry Submitted
          </span>
        )}
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          {!iSubmitted && currentUserId !== postUserId && (
            <div style={{
              marginBottom: 16, padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,215,0,0.2)',
              borderRadius: 'var(--radius)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d4c070', marginBottom: 8, letterSpacing: '0.8px' }}>YOUR SUBMISSION</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Paste your submission link or write your entry…"
                  value={submitForm} onChange={e => setSubmitForm(e.target.value)}
                  style={{ flex: 1, fontSize: 13 }} />
                <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={posting || !submitForm.trim()}>
                  {posting ? '…' : '🚀 Submit'}
                </button>
              </div>
            </div>
          )}

          {subs.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 12px' }}>
              No submissions yet — be the first to enter!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
              {subs.map((sub, idx) => (
                <div key={sub.id} style={{
                  display: 'flex', gap: 10, alignItems: 'center',
                  background: idx === 0 && subs.length > 1 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                  border: idx === 0 && subs.length > 1 ? '1px solid rgba(255,215,0,0.2)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '10px 12px',
                }}>
                  <div style={{
                    width: 28, textAlign: 'center', fontSize: idx < 3 ? 18 : 13,
                    fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0,
                  }}>
                    {idx < 3 ? medals[idx] : `#${idx + 1}`}
                  </div>
                  <Avatar user={sub} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-mid)' }}>{sub.name}</span>
                      <TalentBadge talent={sub.primary_talent} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                      {sub.content.startsWith('http') ? (
                        <a href={sub.content} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-bright)' }}>
                          🔗 {sub.content}
                        </a>
                      ) : sub.content}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleVote(sub.id)}
                      disabled={myVotes.has(sub.id) || sub.user_id === currentUserId || votingId === sub.id}
                      style={{ fontSize: 15, padding: '3px 8px', color: myVotes.has(sub.id) ? 'var(--success)' : 'var(--text-muted)' }}
                    >👍</button>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{sub.vote_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Challenge card ─── */
function ChallengeCard({ post, currentUserId, onLikeToggle, onSubmitted, onDeleted }) {
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isExpired = post.deadline && new Date(post.deadline) < new Date();

  React.useEffect(() => {
    if (isExpired) {
      socialAPI.checkChallengeWinner(post.id).catch(() => { /* silent */ });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, isExpired]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to take down this challenge?')) return;
    setDeleting(true);
    try {
      await socialAPI.deletePost(post.id);
      onDeleted(post.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await socialAPI.toggleLike(post.id);
      onLikeToggle(post.id, res.data.liked, res.data.like_count);
    } catch { /* ignore */ }
    finally { setLiking(false); }
  };

  let daysLeft = null;
  if (post.deadline && !isExpired) {
    const diff = new Date(post.deadline) - new Date();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="card" style={{ marginBottom: 20, overflow: 'hidden', padding: 0 }}>

      {/* Top banner */}
      <div style={{
        background: isExpired
          ? 'linear-gradient(135deg, rgba(80,80,80,0.12), rgba(40,40,40,0.08))'
          : 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.04))',
        borderBottom: `1px solid ${isExpired ? 'var(--border)' : 'rgba(255,215,0,0.15)'}`,
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>{isExpired ? '🏁' : '⚔️'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: isExpired ? 'var(--text-muted)' : '#d4c070' }}>
            {isExpired ? 'Challenge Closed' : 'Active Challenge'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            📤 Submit via: <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{post.submission_type}</span>
          </div>
        </div>
        {!isExpired && daysLeft !== null && (
          <div style={{
            textAlign: 'center',
            background: daysLeft <= 3 ? 'rgba(255,80,80,0.12)' : 'rgba(255,215,0,0.08)',
            border: `1px solid ${daysLeft <= 3 ? 'rgba(255,80,80,0.25)' : 'rgba(255,215,0,0.2)'}`,
            borderRadius: 'var(--radius)', padding: '6px 12px',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: daysLeft <= 3 ? 'var(--danger)' : '#d4c070', lineHeight: 1 }}>{daysLeft}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>DAYS LEFT</div>
          </div>
        )}
        {isExpired && (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', padding: '4px 10px', borderRadius: 99 }}>
            CLOSED
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Avatar user={post.author} size={36} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-mid)' }}>{post.author?.name}</span>
              <TalentBadge talent={post.author?.primary_talent} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(post.created_at)}</div>
          </div>
          {post.user_id === currentUserId && (
            <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto', fontSize: 11 }}
              onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing…' : '🗑 Take Down'}
            </button>
          )}
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: 'var(--text-mid)', marginBottom: 8, lineHeight: 1.3 }}>
          {post.title}
        </h3>

        {post.description && (
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12 }}>
            {post.description}
          </p>
        )}

        {post.rules && (
          <div style={{
            background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.12)',
            borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 14,
            borderLeft: '3px solid rgba(255,215,0,0.35)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#d4c070', marginBottom: 6, letterSpacing: '0.8px' }}>📋 RULES</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{post.rules}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleLike} disabled={liking}
            style={{ color: post.liked_by_me ? '#ff6b9d' : 'var(--text-muted)', gap: 5 }}>
            {post.liked_by_me ? '❤️' : '🤍'} {post.like_count}
          </button>
          {post.deadline && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
              📅 {isExpired ? 'Closed' : 'Ends'} {new Date(post.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <SubmissionsPanel
          postId={post.id}
          postUserId={post.user_id}
          currentUserId={currentUserId}
          iSubmitted={post.i_submitted}
          onSubmitted={() => onSubmitted(post.id)}
        />
      </div>
    </div>
  );
}

/* ─── Create form ─── */
function CreateChallengeForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', rules: '', deadline: '', submission_type: 'link',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await socialAPI.createPost({
        type: 'challenge',
        title: form.title,
        description: form.description || null,
        rules: form.rules || null,
        deadline: form.deadline || null,
        submission_type: form.submission_type,
      });
      onCreated(res.data.post);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create challenge.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Challenge title *</label>
        <input className="form-input" placeholder="48-Hour Hackathon: Build a Fintech App"
          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Describe the challenge…"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          style={{ minHeight: 80 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Rules</label>
        <textarea className="form-textarea" placeholder="List the challenge rules…"
          value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
          style={{ minHeight: 70 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Deadline (optional)</label>
          <input type="date" className="form-input" value={form.deadline}
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Submission method</label>
          <select className="form-select" value={form.submission_type}
            onChange={e => setForm(f => ({ ...f, submission_type: e.target.value }))}>
            <option value="link">Link (GitHub, Demo, etc.)</option>
            <option value="text">Text submission</option>
          </select>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost2 btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting…' : '⚔️ Post Challenge'}
        </button>
      </div>
    </div>
  );
}

export default function ChallengesModule({ posts, currentUserId, onPostCreated, onPostsUpdate }) {
  const [showCreate, setShowCreate] = useState(false);

  const handleLikeToggle = (postId, liked, likeCount) => {
    onPostsUpdate(prev => prev.map(p =>
      p.id === postId ? { ...p, liked_by_me: liked, like_count: likeCount } : p
    ));
  };

  const handleSubmitted = (postId) => {
    onPostsUpdate(prev => prev.map(p =>
      p.id === postId ? { ...p, i_submitted: true } : p
    ));
  };

  const handleDeleted = (postId) => {
    onPostsUpdate(prev => prev.filter(p => p.id !== postId));
  };

  const active = posts.filter(p => !p.deadline || new Date(p.deadline) >= new Date());
  const closed = posts.filter(p => p.deadline && new Date(p.deadline) < new Date());

  return (
    <div>
      {/* Module header banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 24, padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(255,215,0,0.06), rgba(255,140,0,0.03))',
        border: '1px solid rgba(255,215,0,0.12)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ fontSize: 32 }}>⚔️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-mid)' }}>
            Community Challenges
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {active.length} active · {closed.length} closed · Compete, submit, vote
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ Cancel' : '+ New Challenge'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-mid)', marginBottom: 16 }}>
            ⚔️ New Community Challenge
          </div>
          <CreateChallengeForm
            onCreated={(post) => { onPostCreated(post); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {posts.length === 0 && !showCreate && (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-text">
            No challenges yet.<br />
            Start a hackathon, coding sprint, or design battle!
          </div>
        </div>
      )}

      {active.map(post => (
        <ChallengeCard key={post.id} post={post} currentUserId={currentUserId}
          onLikeToggle={handleLikeToggle} onSubmitted={handleSubmitted} onDeleted={handleDeleted} />
      ))}

      {closed.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
            cursor: 'pointer', padding: '8px 0', userSelect: 'none', letterSpacing: '0.5px',
          }}>
            🏁 {closed.length} Closed Challenge{closed.length !== 1 ? 's' : ''}
          </summary>
          <div style={{ marginTop: 12, opacity: 0.75 }}>
            {closed.map(post => (
              <ChallengeCard key={post.id} post={post} currentUserId={currentUserId}
                onLikeToggle={handleLikeToggle} onSubmitted={handleSubmitted} onDeleted={handleDeleted} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
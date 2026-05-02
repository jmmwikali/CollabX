import React, { useState } from 'react';
import { Avatar, TalentBadge, formatTime, Modal } from '../Layout';
import { socialAPI } from '../../services/socialAPI';
import { useAuth } from '../../context/AuthContext';

/* ─── Tag pill helper ─── */
function TagPill({ label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 600,
      background: 'rgba(157, 217, 253, 0.12)',
      color: 'var(--accent)',
      border: '1px solid rgba(157, 217, 253, 0.2)',
      marginRight: 4, marginBottom: 4,
    }}>{label}</span>
  );
}

/* ─── Single invite post card ─── */
function TeamInviteCard({ post, onRequestSent, onDeleted }) {
  const { user } = useAuth();
  const [showRequest, setShowRequest] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [form, setForm] = useState({ message: '', skills: '', portfolio: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isOwner = post.is_mine;
  const myStatus = post.my_request_status;

  const isDeadlinePassed = post.deadline && new Date(post.deadline) < new Date();

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

  const handleRequest = async () => {
    if (!form.message.trim()) { setError('Please write a short message.'); return; }
    setSubmitting(true); setError('');
    try {
      await socialAPI.requestJoin(post.id, form);
      setShowRequest(false);
      setForm({ message: '', skills: '', portfolio: '' });
      onRequestSent(post.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    } finally { setSubmitting(false); }
  };

  const loadRequests = async () => {
    setReqLoading(true);
    try {
      const res = await socialAPI.getJoinRequests(post.id);
      setRequests(res.data.requests || []);
      setShowRequests(true);
    } catch { /* ignore */ }
    finally { setReqLoading(false); }
  };

  const handleRespond = async (reqId, status) => {
    try {
      await socialAPI.respondJoinRequest(post.id, reqId, status);
      setRequests(prev => prev.filter(r => r.id !== reqId));
    } catch { /* ignore */ }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16, overflow: 'hidden', padding: 0 }}>

        {/* Card header stripe */}
        <div style={{
          padding: '10px 18px',
          background: 'rgba(0,184,204,0.06)',
          borderBottom: '1px solid rgba(0,184,204,0.12)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 16 }}>🧑‍🤝‍🧑</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent2)' }}>
              Team Invitation
            </span>
            {post.team_name && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                · {post.team_name}
              </span>
            )}
          </div>
          {isOwner && post.request_count > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'rgba(157,217,253,0.12)', color: 'var(--accent)',
              border: '1px solid rgba(157,217,253,0.2)',
              borderRadius: 99, padding: '2px 10px',
            }}>
              {post.request_count} applicant{post.request_count !== 1 ? 's' : ''}
            </span>
          )}
          {isDeadlinePassed && (
            <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700 }}>Closed</span>
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

          {/* Title + description */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 6 }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>
              {post.description}
            </p>
          )}

          {/* Skills + Roles side by side */}
          {(post.skills_required?.length > 0 || post.roles_needed?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {post.skills_required?.length > 0 && (
                <div style={{
                  background: 'rgba(157,217,253,0.05)', borderRadius: 'var(--radius)',
                  padding: '10px 12px', border: '1px solid rgba(157,217,253,0.1)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, letterSpacing: '0.8px' }}>SKILLS NEEDED</div>
                  <div>{post.skills_required.map(s => <TagPill key={s} label={s} />)}</div>
                </div>
              )}
              {post.roles_needed?.length > 0 && (
                <div style={{
                  background: 'rgba(0,184,204,0.05)', borderRadius: 'var(--radius)',
                  padding: '10px 12px', border: '1px solid rgba(0,184,204,0.1)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent2)', marginBottom: 6, letterSpacing: '0.8px' }}>ROLES</div>
                  <div>{post.roles_needed.map(r => <TagPill key={r} label={r} />)}</div>
                </div>
              )}
            </div>
          )}

          {/* Meta pills row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {post.commitment_level && (
              <span style={{
                fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500,
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '3px 10px',
              }}>
                ⏱ {post.commitment_level.replace('_', ' ')}
              </span>
            )}
            {post.deadline && (
              <span style={{
                fontSize: 11, color: isDeadlinePassed ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: 500,
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 99, padding: '3px 10px',
              }}>
                📅 {isDeadlinePassed ? 'Closed' : `Deadline: ${new Date(post.deadline).toLocaleDateString()}`}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
            {!isOwner && !myStatus && !isDeadlinePassed && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowRequest(true)}>
                🤝 Request to Join
              </button>
            )}
            {!isOwner && myStatus === 'pending' && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>⏳ Application pending…</span>
            )}
            {!isOwner && myStatus === 'accepted' && (
              <span style={{ fontSize: 12, color: 'var(--success)', padding: '6px 0', fontWeight: 700 }}>✓ Accepted</span>
            )}
            {isOwner && (
              <button className="btn btn-secondary btn-sm" onClick={loadRequests} disabled={reqLoading}>
                {reqLoading ? 'Loading…' : `👥 Review Applicants (${post.request_count})`}
              </button>
            )}
            {isOwner && (
              <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing…' : '🗑 Take Down'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Request Invite Modal */}
      <Modal isOpen={showRequest} onClose={() => { setShowRequest(false); setError(''); }} title="Request to Join">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Short message *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Why do you want to join? What can you bring?"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              style={{ minHeight: 80 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Your skills (optional)</label>
            <input className="form-input" placeholder="e.g. React, Node.js, UI Design" value={form.skills}
              onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Portfolio / GitHub link (optional)</label>
            <input className="form-input" placeholder="https://github.com/you" value={form.portfolio}
              onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))} />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowRequest(false); setError(''); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleRequest} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Owner: View Requests Modal */}
      <Modal isOpen={showRequests} onClose={() => setShowRequests(false)} title={`Applicants (${requests.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
          {requests.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No pending requests.</div>
          )}
          {requests.map(req => (
            <div key={req.id} className="card card-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar user={req} size={32} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-mid)' }}>{req.name}</div>
                  <TalentBadge talent={req.primary_talent} />
                </div>
              </div>
              {req.message && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>"{req.message}"</p>}
              {req.skills && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>🛠 {req.skills}</div>}
              {req.portfolio && (
                <a href={req.portfolio} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--accent-bright)', display: 'block', marginBottom: 8 }}>
                  🔗 {req.portfolio}
                </a>
              )}
              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleRespond(req.id, 'accepted')}>Accept</button>
                  <button className="btn btn-ghost2 btn-sm" onClick={() => handleRespond(req.id, 'rejected')}>Decline</button>
                </div>
              )}
              {req.status !== 'pending' && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{req.status}</span>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

/* ─── Create Post Form ─── */
function CreateTeamInviteForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '', team_name: '', description: '',
    skills_required: '', roles_needed: '', tech_stack: '',
    commitment_level: '', deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toArray = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.team_name.trim()) { setError('Team name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await socialAPI.createPost({
        type: 'team_invite',
        title: form.title,
        team_name: form.team_name,
        description: form.description || null,
        skills_required: toArray(form.skills_required),
        roles_needed: toArray(form.roles_needed),
        tech_stack: toArray(form.tech_stack),
        commitment_level: form.commitment_level || null,
        deadline: form.deadline || null,
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
        <input className="form-input" placeholder="Looking for a backend dev for our fintech app"
          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Team name *</label>
        <input className="form-input" placeholder="My Startup Name"
          value={form.team_name} onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" placeholder="Tell people about your project and goals…"
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          style={{ minHeight: 80 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Skills required (comma-separated)</label>
          <input className="form-input" placeholder="React, Node.js, AWS"
            value={form.skills_required} onChange={e => setForm(f => ({ ...f, skills_required: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Roles needed (comma-separated)</label>
          <input className="form-input" placeholder="Frontend Dev, Designer"
            value={form.roles_needed} onChange={e => setForm(f => ({ ...f, roles_needed: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Commitment level</label>
          <select className="form-select" value={form.commitment_level}
            onChange={e => setForm(f => ({ ...f, commitment_level: e.target.value }))}>
            <option value="">Select…</option>
            <option value="part_time">Part-time</option>
            <option value="full_time">Full-time</option>
            <option value="weekends">Weekends only</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Application deadline (optional)</label>
        <input type="date" className="form-input" value={form.deadline}
          onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost2 btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting…' : '🧑‍🤝‍🧑 Post Invitation'}
        </button>
      </div>
    </div>
  );
}

/* ─── Module Export ─── */
export default function TeamInviteModule({ posts, onPostCreated, onPostsUpdate }) {
  const [showCreate, setShowCreate] = useState(false);

  const handleRequestSent = (postId) => {
    onPostsUpdate(prev => prev.map(p =>
      p.id === postId ? { ...p, my_request_status: 'pending', request_count: (p.request_count || 0) + 1 } : p
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
        background: 'rgba(0,184,204,0.05)',
        border: '1px solid rgba(0,184,204,0.12)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ fontSize: 32 }}>🧑‍🤝‍🧑</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text-mid)' }}>
            Team Invitations
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {posts.length} open position{posts.length !== 1 ? 's' : ''} · Find your next collaborator
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ Cancel' : '+ Post Invitation'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-mid)', marginBottom: 16 }}>
            🧑‍🤝‍🧑 New Team Invitation
          </div>
          <CreateTeamInviteForm
            onCreated={(post) => { onPostCreated(post); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {posts.length === 0 && !showCreate && (
        <div className="empty-state">
          <div className="empty-state-icon">🧑‍🤝‍🧑</div>
          <div className="empty-state-text">No team invitation posts yet.<br />Be the first to post one!</div>
        </div>
      )}

      {posts.map(post => (
        <TeamInviteCard key={post.id} post={post} onRequestSent={handleRequestSent} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
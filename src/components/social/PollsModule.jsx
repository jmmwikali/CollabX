import React, { useState } from 'react';
import { Avatar, TalentBadge, formatTime } from '../Layout';
import { socialAPI } from '../../services/socialAPI';

/* ─── Vote percentage bar ─── */
function VoteBar({ label, count, total, selected }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{
          fontSize: 13, color: selected ? 'var(--accent)' : 'var(--text-secondary)',
          fontWeight: selected ? 700 : 400,
        }}>
          {selected && '✓ '}{label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{pct}% ({count})</span>
      </div>
      <div style={{
        height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 99,
          background: selected
            ? 'linear-gradient(90deg, var(--accent), var(--accent2))'
            : 'rgba(157,217,253,0.35)',
          transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

/* ─── Poll card ─── */
function PollCard({ post, onVoted, onDeleted }) {
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [localVoteCounts, setLocalVoteCounts] = useState(post.poll_vote_counts || {});
  const [localTotalVotes, setLocalTotalVotes] = useState(post.poll_total_votes || 0);
  const [myVotes, setMyVotes] = useState(post.my_poll_votes || []);
  const [error, setError] = useState('');

  const hasVoted = myVotes.length > 0;
  const isMulti = post.poll_multi;
  const options = post.poll_options || [];

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to take down this poll?')) return;
    setDeleting(true);
    try {
      await socialAPI.deletePost(post.id);
      onDeleted(post.id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post.');
      setDeleting(false);
    }
  };

  const toggleOption = (idx) => {
    if (hasVoted) return;
    if (isMulti) {
      setSelectedIndices(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      );
    } else {
      setSelectedIndices([idx]);
    }
    setError('');
  };

  const handleVote = async () => {
    if (selectedIndices.length === 0) { setError('Please select an option.'); return; }
    setVoting(true); setError('');
    try {
      const res = await socialAPI.votePoll(post.id, selectedIndices);
      setLocalVoteCounts(res.data.vote_counts || {});
      setLocalTotalVotes(res.data.total_votes || 0);
      setMyVotes(res.data.my_votes || selectedIndices);
      setSelectedIndices([]);
      onVoted(post.id, res.data.vote_counts, res.data.total_votes, res.data.my_votes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record vote.');
    } finally { setVoting(false); }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <Avatar user={post.author} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-mid)' }}>{post.author?.name}</span>
            <TalentBadge talent={post.author?.primary_talent} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(post.created_at)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            background: 'rgba(196,154,74,0.12)', color: '#d4b070', border: '1px solid rgba(196,154,74,0.2)',
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>📊 Poll</span>
          {isMulti && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Multi-choice</span>
          )}
        </div>
      </div>

      {/* Question */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 14 }}>
        {post.title}
      </h3>
      {post.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{post.description}</p>
      )}

      {/* Options */}
      {hasVoted ? (
        // Show results
        <div style={{ marginBottom: 14 }}>
          {options.map((opt, idx) => (
            <VoteBar
              key={idx}
              label={opt}
              count={localVoteCounts[idx] || 0}
              total={localTotalVotes}
              selected={myVotes.includes(idx)}
            />
          ))}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {localTotalVotes} vote{localTotalVotes !== 1 ? 's' : ''} total
          </div>
        </div>
      ) : (
        // Show clickable options
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {options.map((opt, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => toggleOption(idx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 'var(--radius)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'rgba(157,217,253,0.1)' : 'var(--bg-glass)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all var(--transition-base)',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 600 : 400, fontSize: 13.5,
                  fontFamily: 'var(--font-body)',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: isMulti ? 4 : 99,
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#0b2233',
                  transition: 'all var(--transition-base)',
                }}>
                  {isSelected && '✓'}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!hasVoted && (
        <>
          {error && <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleVote}
              disabled={voting || selectedIndices.length === 0}
            >
              {voting ? 'Voting…' : 'Vote'}
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {localTotalVotes} vote{localTotalVotes !== 1 ? 's' : ''} so far
            </span>
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
        </>
      )}
      {hasVoted && post.is_mine && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Removing…' : '🗑 Take Down'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Create form ─── */
function CreatePollForm({ onCreated, onCancel }) {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isMulti, setIsMulti] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateOption = (idx, val) => setOptions(prev => prev.map((o, i) => i === idx ? val : o));
  const addOption = () => { if (options.length < 6) setOptions(prev => [...prev, '']); };
  const removeOption = (idx) => { if (options.length > 2) setOptions(prev => prev.filter((_, i) => i !== idx)); };

  const handleSubmit = async () => {
    const cleanOptions = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim()) { setError('Question is required.'); return; }
    if (cleanOptions.length < 2) { setError('At least 2 options are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await socialAPI.createPost({
        type: 'poll',
        title: question,
        description: description || null,
        poll_options: cleanOptions,
        poll_multi: isMulti,
      });
      onCreated(res.data.post);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create poll.');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label">Poll question *</label>
        <input className="form-input" placeholder="React or Vue for your next project?"
          value={question} onChange={e => setQuestion(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Additional context (optional)</label>
        <input className="form-input" placeholder="Give more context about your question…"
          value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Options ({options.length}/6)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((opt, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="form-input" placeholder={`Option ${idx + 1}`}
                value={opt} onChange={e => updateOption(idx, e.target.value)} />
              {options.length > 2 && (
                <button className="btn btn-ghost btn-icon" onClick={() => removeOption(idx)}
                  style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>✕</button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button className="btn btn-ghost2 btn-sm" onClick={addOption} style={{ alignSelf: 'flex-start' }}>
              + Add option
            </button>
          )}
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
        <input type="checkbox" checked={isMulti} onChange={e => setIsMulti(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
        <span style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>Allow multiple selections</span>
      </label>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost2 btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Posting…' : 'Post Poll'}
        </button>
      </div>
    </div>
  );
}

export default function PollsModule({ posts, onPostCreated, onPostsUpdate }) {
  const [showCreate, setShowCreate] = useState(false);

  const handleVoted = (postId, voteCounts, totalVotes, myVotes) => {
    onPostsUpdate(prev => prev.map(p =>
      p.id === postId
        ? { ...p, poll_vote_counts: voteCounts, poll_total_votes: totalVotes, my_poll_votes: myVotes }
        : p
    ));
  };

  const handleDeleted = (postId) => {
    onPostsUpdate(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <h3 className="section-title">📊 Polls & Opinions</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? '✕ Cancel' : '+ Create Poll'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-mid)', marginBottom: 16 }}>
            New Poll
          </div>
          <CreatePollForm
            onCreated={(post) => { onPostCreated(post); setShowCreate(false); }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {posts.length === 0 && !showCreate && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">No polls yet.<br />Ask the community something!</div>
        </div>
      )}

      {posts.map(post => (
        <PollCard key={post.id} post={post} onVoted={handleVoted} onDeleted={handleDeleted} />
      ))}
    </div>
  );
}
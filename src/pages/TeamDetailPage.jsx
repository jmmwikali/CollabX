import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { teamsAPI, messagesAPI, usersAPI } from '../services/api';
import { AppShell, Avatar, TalentBadge, RepBadge, Modal, LoadingSpinner, formatTime } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Leave team state
  const [showLeave, setShowLeave] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  // Older messages pagination
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasOlder, setHasOlder] = useState(true);
  const chatScrollRef = useRef(null);

  const loadTeam = useCallback(async () => {
    try {
      const res = await teamsAPI.getTeamById(id);
      setTeam(res.data.team);
    } catch { navigate('/teams'); }
  }, [id, navigate]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await messagesAPI.getTeamMessages(id, { limit: 50 });
      setMessages(res.data.messages || []);
      // If we got fewer than 50 on first load, there's nothing older to fetch
      setHasOlder((res.data.messages || []).length === 50);
    } catch (err) {
      console.error('Could not load team messages:', err.response?.status === 403 ? 'Not a member' : err.message);
    }
  }, [id]);

  useEffect(() => {
    Promise.all([loadTeam(), loadMessages()]).finally(() => setLoading(false));
    pollRef.current = setInterval(loadMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [loadTeam, loadMessages]);

  const userSentRef = useRef(false); // true when the local user just sent a message

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    // Auto-scroll only if user just sent a message OR is already near the bottom (within 120px)
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (userSentRef.current || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    userSentRef.current = false;
  }, [messages]);

  // FIX: Defined handleSearch with useCallback BEFORE the useEffect that calls it,
  // and added it to the useEffect dependency array to satisfy the rules of hooks.
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await usersAPI.getUsers({ search: searchQuery, limit: 6 });
      setSearchUsers(res.data.users || []);
    } catch (err) {
      console.error("Search failed. Check if your API supports the 'search' parameter:", err);
    }
  }, [searchQuery]);

  // FIX: handleSearch is now properly declared above and included in deps
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearch();
      } else {
        setSearchUsers([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, handleSearch]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!msgInput.trim() || sending) return;
    setSending(true);
    userSentRef.current = true; // flag so scroll snaps to bottom on send
    try {
      const res = await messagesAPI.sendTeamMessage(id, { content: msgInput.trim() });
      setMessages(prev => [...prev, res.data.message]);
      setMsgInput('');
    } catch { }
    finally { setSending(false); }
  };

  const handleInvite = async (userId) => {
    try {
      await teamsAPI.inviteUser(id, { user_id: userId, message: inviteMsg });
      setInviteStatus('Invitation sent!');
    } catch (err) {
      setInviteStatus(err.response?.data?.message || 'Failed to invite.');
    }
  };

  // Load messages older than the earliest one currently in state
  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasOlder || messages.length === 0) return;
    setLoadingOlder(true);
    const oldestId = messages[0].id;
    const scrollEl = chatScrollRef.current;
    // Capture scroll height before insert so we can restore position after
    const prevScrollHeight = scrollEl?.scrollHeight || 0;
    try {
      const res = await messagesAPI.getTeamMessages(id, { before: oldestId, limit: 50 });
      const older = res.data.messages || [];
      setMessages(prev => [...older, ...prev]);
      setHasOlder(older.length === 50);
      // Restore scroll position so the view doesn't jump to top
      requestAnimationFrame(() => {
        if (scrollEl) {
          scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
        }
      });
    } catch { }
    finally { setLoadingOlder(false); }
  }, [id, loadingOlder, hasOlder, messages]);

  // Leave team
  const handleLeave = async () => {
    setLeaveLoading(true);
    setLeaveError('');
    try {
      await teamsAPI.leaveTeam(id);
      navigate('/teams');
    } catch (err) {
      setLeaveError(err.response?.data?.message || 'Failed to leave team.');
      setLeaveLoading(false);
    }
  };

  const isMember = team?.members?.some(m => m.id === user?.id);
  const isCreator = team?.created_by === user?.id;

  if (loading) return <AppShell title="Team"><LoadingSpinner size={36} /></AppShell>;
  if (!team) return null;

  return (
    <AppShell
      title={team.name}
      actions={
        isMember && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(true)}>
              + Invite Member
            </button>
            {/* Creators cannot leave — backend enforces this too, but we hide the button */}
            {!isCreator && (
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
                onClick={() => { setShowLeave(true); setLeaveError(''); }}
              >
                Leave
              </button>
            )}
          </div>
        )
      }
    >
      <div className="team-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, height: 'calc(100vh - 140px)' }}>

        {/* Chat area */}
        <div className={`card team-chat-panel${showChat ? '' : ' hidden-mobile'}`} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="messages-back-btn"
              onClick={() => setShowChat(false)}
              style={{ display: 'none', background: 'none', border: 'none', color: 'var(--blue)', fontSize: 22, cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1, flexShrink: 0 }}
            >←</button>
            <Link to="/teams" className="back-btn" style={{ fontSize: 30, color: 'var(--accent-bright)', textDecoration: 'none' }}>←</Link>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius)',
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}><img src="/images/team.png" alt="teams" width={'24px'} height={'24px'}/></div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{team.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {team.members?.length} members · {messages.length} messages
              </div>
            </div>
          </div>

          <div
            ref={chatScrollRef}
            style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {!isMember ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔒</div>
                <div className="empty-state-text">Join this team to see messages.</div>
              </div>
            ) : (
              <>
                {/* Load older messages button */}
                {hasOlder && messages.length > 0 && (
                  <div style={{ textAlign: 'center', paddingBottom: 4 }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={loadOlderMessages}
                      disabled={loadingOlder}
                      style={{ fontSize: 12 }}
                    >
                      {loadingOlder ? 'Loading...' : '↑ Load older messages'}
                    </button>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><img src="/images/messages.png" alt="teams" width={'30px'} height={'30px'} /> </div>
                    <div className="empty-state-text">No messages yet. Start the conversation!</div>
                  </div>
                ) : messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  const prevMsg = messages[i - 1];
                  const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                      {!isMe && (
                        <div style={{ width: 32, flexShrink: 0 }}>
                          {showAvatar && <Avatar user={{ name: msg.sender_name, avatar_url: msg.sender_avatar }} size={32} />}
                        </div>
                      )}
                      <div style={{ maxWidth: '65%' }}>
                        {!isMe && showAvatar && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, marginLeft: 4 }}>
                            {msg.sender_name}
                          </div>
                        )}
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? 'linear-gradient(135deg, var(--accent), #2563eb)' : 'var(--bg-glass)',
                          color: isMe ? 'white' : 'var(--text-secondary)',
                          fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left', marginLeft: 4 }}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isMember && (
            <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <input
                className="form-input"
                placeholder="Type a message..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                disabled={sending}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" type="submit" disabled={sending || !msgInput.trim()}>
                {sending ? '...' : '↑'}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className={`team-sidebar-panel${showChat ? ' hidden-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)'}}>About</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {team.description || 'No description provided.'}
            </p>
            <div className="divider" />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Created by <strong style={{ color: 'var(--text-secondary)' }}>{team.creator_name}</strong>
              <br />{formatTime(team.created_at)}
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
              <span>Members</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{team.members?.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {team.members?.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar user={m} size={32} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name} {m.id === user?.id && <span style={{ fontSize: 10, color: 'var(--accent-bright)' }}>(you)</span>}
                    </div>
                    <TalentBadge talent={m.primary_talent} />
                  </div>
                  <RepBadge points={m.reputation_points} />
                </div>
              ))}
            </div>
            {/* Open Chat — mobile only */}
            {isMember && (
              <button
                className="team-open-chat-btn btn btn-primary"
                onClick={() => setShowChat(true)}
                style={{ display: 'none', width: '100%', marginTop: 14 }}
              >💬 Open Team Chat</button>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal isOpen={showInvite} onClose={() => { setShowInvite(false); setInviteStatus(''); setSearchUsers([]); setSearchQuery(''); }} title="Invite to Team">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
          </div>

          {searchUsers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searchUsers.map(u => (
                <div key={u.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={u} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                    <TalentBadge talent={u.primary_talent} />
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={() => handleInvite(u.id)}>Invite</button>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Personal message</label>
            <input className="form-input" placeholder="Add a message..." value={inviteMsg} onChange={e => setInviteMsg(e.target.value)} />
          </div>

          {inviteStatus && (
            <div className={`alert ${inviteStatus.includes('sent') ? 'alert-success' : 'alert-error'}`}>
              {inviteStatus}
            </div>
          )}
        </div>
      </Modal>

      {/* Leave Team Confirmation Modal */}
      <Modal isOpen={showLeave} onClose={() => setShowLeave(false)} title="Leave Team">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to leave <strong style={{ color: 'var(--text-mid)' }}>{team.name}</strong>?
            You'll lose <strong style={{ color: '#f87171' }}>20 reputation points</strong> and will need a new invitation to rejoin.
          </p>
          {leaveError && (
            <div className="alert alert-error">{leaveError}</div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowLeave(false)} disabled={leaveLoading}>
              Cancel
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              onClick={handleLeave}
              disabled={leaveLoading}
            >
              {leaveLoading ? 'Leaving...' : 'Leave Team'}
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
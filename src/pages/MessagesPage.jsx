import React, { useState, useEffect, useRef, useCallback } from 'react';
import { messagesAPI } from '../services/api';
import { AppShell, Avatar, formatTime, LoadingSpinner } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function MessagesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    messagesAPI.getConversations()
      .then(res => {
        if (!isMountedRef.current) return;
        const convs = res.data.conversations || [];
        setConversations(convs);

        const selectedUser = location.state?.selectedUser;
        if (selectedUser) {
          const existing = convs.find(c => c.other_user_id === selectedUser.id);
          if (existing) {
            setActiveConv(existing);
            setShowChat(true);
          } else {
            const syntheticConv = {
              other_user_id: selectedUser.id,
              other_user_name: selectedUser.name,
              other_user_avatar: selectedUser.avatar_url,
              primary_talent: selectedUser.primary_talent,
              last_message: null,
              last_message_at: null,
              unread_count: 0,
            };
            setConversations(prev => [syntheticConv, ...prev]);
            setActiveConv(syntheticConv);
            setShowChat(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => { if (isMountedRef.current) setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await messagesAPI.getDirectMessages(userId);
      if (isMountedRef.current) setMessages(res.data.messages || []);
    } catch { }
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.other_user_id);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(activeConv.other_user_id), 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConv = (conv) => {
    setActiveConv(conv);
    setShowChat(true);
  };

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim() || !activeConv || sending) return;
    setSending(true);
    const content = input.trim();
    try {
      const res = await messagesAPI.sendDirectMessage(activeConv.other_user_id, { content });
      if (isMountedRef.current) {
        setMessages(prev => [...prev, res.data.message]);
        setInput('');
        setConversations(prev => prev.map(c =>
          c.other_user_id === activeConv.other_user_id
            ? { ...c, last_message: content, last_message_at: new Date().toISOString() }
            : c
        ));
      }
    } catch { }
    finally {
      if (isMountedRef.current) setSending(false);
    }
  };

  const unreadTotal = conversations.reduce((a, c) => a + (c.unread_count || 0), 0);

  return (
    <AppShell title="Messages" unreadDms={unreadTotal}>
      <div
        className="messages-layout"
        style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 140px)' }}
      >

        {/* Conversations list */}
        <div
          className={`card messages-conv-panel${showChat ? ' hidden-mobile' : ''}`}
          style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Conversations
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <LoadingSpinner size={24} />
            ) : conversations.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div style={{ fontSize: 28 }}>
                  <img src="/images/messages.png" alt="messages" width="40" height="40" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No conversations yet</div>
              </div>
            ) : conversations.map(conv => (
              <div
                key={conv.other_user_id}
                onClick={() => selectConv(conv)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  background: activeConv?.other_user_id === conv.other_user_id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  borderLeft: activeConv?.other_user_id === conv.other_user_id ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <Avatar user={{ name: conv.other_user_name, avatar_url: conv.other_user_avatar }} size={38} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{conv.other_user_name}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{formatTime(conv.last_message_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.last_message || 'No messages yet'}
                  </div>
                </div>
                {conv.unread_count > 0 && (
                  <span className="nav-badge">{conv.unread_count}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div
          className={`card messages-chat-panel${showChat ? '' : ' hidden-mobile'}`}
          style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {!activeConv ? (
            <div className="empty-state" style={{ height: '100%' }}>
              <div className="empty-state-icon">
                <img src="/images/messages.png" alt="messages" width="40" height="40" />
              </div>
              <div className="empty-state-text">Select a conversation to start messaging</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="messages-back-btn"
                  onClick={() => setShowChat(false)}
                  style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    color: 'var(--blue)',
                    fontSize: 22,
                    cursor: 'pointer',
                    padding: '0 8px 0 0',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ←
                </button>
                <Avatar user={{ name: activeConv.other_user_name, avatar_url: activeConv.other_user_avatar }} size={36} />
                <div>
                  <div style={{ fontWeight: 700 }}>{activeConv.other_user_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {activeConv.primary_talent?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 ? (
                  <div className="empty-state"><div>No messages yet. Say hello! 👋</div></div>
                ) : messages.map(msg => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
                      {!isMe && <Avatar user={{ name: msg.sender_name, avatar_url: msg.sender_avatar }} size={28} />}
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{
                          padding: '9px 14px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMe ? 'linear-gradient(135deg, var(--accent), #2563eb)' : 'var(--bg-glass)',
                          color: isMe ? 'white' : 'var(--text-muted)',
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                          {formatTime(msg.created_at)}
                          {isMe && msg.is_read ? ' · Read' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  placeholder={`Message ${activeConv.other_user_name}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={sending}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" type="submit" disabled={sending || !input.trim()}>
                  {sending ? '...' : '↑'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
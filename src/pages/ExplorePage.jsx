import React, { useState, useEffect } from 'react';
import { usersAPI, teamsAPI } from '../services/api';
import { AppShell, Avatar, TalentBadge, RepBadge, Modal, LoadingSpinner } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TALENTS = ['', 'frontend','backend','fullstack','designer','ui_ux','writer','marketer','devops','mobile','data_scientist','product_manager'];
const LEVELS = ['', 'beginner', 'intermediate', 'advanced'];

export default function ExplorePage() {
  // const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ talent: '', skill_level: '', search: '' });
  const [myTeams, setMyTeams] = useState([]);
  const [inviteModal, setInviteModal] = useState(null);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteStatus, setInviteStatus] = useState('');
  const navigate = useNavigate();

  // FIX: Removed useCallback wrapper for fetchUsers — it was causing a
  // re-creation loop where fetchUsers reference change re-triggered the
  // useEffect, causing a double-fetch on every filter change.
  useEffect(() => {
    const controller = new AbortController();
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {};
        if (filters.talent) params.talent = filters.talent;
        if (filters.skill_level) params.skill_level = filters.skill_level;
        if (filters.search) params.search = filters.search;
        const res = await usersAPI.getUsers(params);
        setUsers(res.data.users || []);
      } catch (err) {
        if (err.name !== 'CanceledError') console.error('Explore Search Error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [filters.talent, filters.skill_level, filters.search]);

  useEffect(() => {
    teamsAPI.getMyTeams().then(res => setMyTeams(res.data.teams || [])).catch(() => {});
  }, []);

  const handleFilterChange = e => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openInvite = (targetUser) => {
    setInviteModal(targetUser);
    setInviteMsg('');
    setInviteStatus('');
  };

  const handleInvite = async (teamId) => {
    if (!inviteModal || !teamId) return;
    try {
      await teamsAPI.inviteUser(teamId, { user_id: inviteModal.id, message: inviteMsg });
      setInviteStatus('success');
    } catch (err) {
      setInviteStatus(err.response?.data?.message || 'Failed to send invite');
    }
  };

  return (
    <AppShell title="Explore Talent">
      {/* Filters */}
      <div className="card card-sm" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1 1 200px' }}>
          <label className="form-label">Search</label>
          <input className="form-input" name="search" placeholder="Search by name or bio..." value={filters.search} onChange={handleFilterChange} />
        </div>
        <div className="form-group" style={{ flex: '0 0 160px' }}>
          <label className="form-label">Talent</label>
          <select className="form-select" name="talent" value={filters.talent} onChange={handleFilterChange}>
            <option value="">All Talents</option>
            {TALENTS.filter(Boolean).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: '0 0 140px' }}>
          <label className="form-label">Level</label>
          <select className="form-select" name="skill_level" value={filters.skill_level} onChange={handleFilterChange}>
            <option value="">All Levels</option>
            {LEVELS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <button className="btn btn-ghost btn-sm" style={{color: '#3d5c70'}} onClick={() => setFilters({ talent: '', skill_level: '', search: '' })}>
          Clear
        </button>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: 16, color: 'var(--text-tertiary)', fontSize: 13 }}>
        {loading ? 'Loading...' : `${users.length} talents found`}
      </div>

      {/* User grid */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid-2" style={{ gap: 16 }} >
          {users.map(u => (
            <div key={u.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onClick={() => navigate("/userprofile", {state : {u}})}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar user={u} size={48} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-mid)' }}>{u.name}</div>
                  <TalentBadge talent={u.primary_talent} />
                </div>
              </div>
              {u.bio && (
                <p style={{
                  fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.5,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>{u.bio}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99 }}>
                  {u.skill_level}
                </span>
                <RepBadge points={u.reputation_points} />
                <button className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => openInvite(u)}>
                  + Invite
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div style={{ gridColumn: '1/-1' }}>
              <div className="empty-state">
                <div className="empty-state-icon"><img src="/images/search.png" alt="search" width={"30px"} height={"30px"} /></div>
                <div className="empty-state-text">No users found matching your filters.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <Modal isOpen={!!inviteModal} onClose={() => setInviteModal(null)} title={`Invite ${inviteModal?.name}`}>
        {inviteStatus === 'success' ? (
          <div className="alert alert-success">✅ Invitation sent successfully!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: 'var(--text-dark)', fontSize: 14 }}>
              Choose a team to invite <strong>{inviteModal?.name}</strong> to:
            </p>
            {myTeams.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>
                You need to create a team first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myTeams.map(team => (
                  <div key={team.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-mid)' }}>{team.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{team.member_count} members</div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => handleInvite(team.id)}>Invite</button>
                  </div>
                ))}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Message (optional)</label>
              <input className="form-input" placeholder="Add a personal message..." value={inviteMsg} onChange={e => setInviteMsg(e.target.value)} />
            </div>
            {inviteStatus && inviteStatus !== 'success' && (
              <div className="alert alert-error">{inviteStatus}</div>
            )}
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

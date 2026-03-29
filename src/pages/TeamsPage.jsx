import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamsAPI } from '../services/api';
import { AppShell, Modal, LoadingSpinner, formatTime } from '../components/Layout';


export default function TeamsPage() {
  const [myTeams, setMyTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [tab, setTab] = useState('mine');

  const load = () => {
    setLoading(true);
    Promise.all([
      teamsAPI.getMyTeams(),
      teamsAPI.getMyInvitations(),
    ]).then(([t, i]) => {
      setMyTeams(t.data.teams || []);
      setInvitations(i.data.invitations || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault();
    setCreateError(''); setCreateLoading(true);
    try {
      await teamsAPI.createTeam(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setCreateLoading(false);
    }
  };

  // FIX: Renamed parameter from `id` to `inviteId` to be unambiguous
  // and avoid potential shadowing bugs if this component ever gains route params.
  const handleInviteResponse = async (inviteId, status) => {
    try {
      await teamsAPI.respondToInvitation(inviteId, status);
      load();
    } catch (err) { console.error(err); }
  };

  const TEAM_COLORS = ['#3b82f6','#06b6d4','#8b5cf6','#f472b6','#10b981','#f59e0b','#ef4444'];

  return (
    <AppShell
      title="Teams"
      pendingInvites={invitations.length}
      actions={
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Team
        </button>
      }
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[['mine', `My Teams (${myTeams.length})`], ['invites', `Invitations (${invitations.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 18px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            color: tab === key ? 'var(--accent-bright)' : 'var(--text-secondary)',
            borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s',
          }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : tab === 'mine' ? (
        <>
          {myTeams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><img src="/images/team.png" alt="teams" width={'30px'} height={'30px'}/></div>
              <div className="empty-state-text">You're not in any teams yet.</div>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Your First Team</button>
            </div>
          ) : (
            <div className="grid-3">
              {myTeams.map((team, i) => (
                <Link key={team.id} to={`/teams/${team.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius)',
                        background: TEAM_COLORS[i % TEAM_COLORS.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0,
                      }}><img src="/images/team.png" alt="teams" width={'24px'} height={'24px'}/></div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{team.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {team.member_count} members · {formatTime(team.created_at)}
                        </div>
                      </div>
                    </div>
                    {team.description && (
                      <p style={{
                        fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>{team.description}</p>
                    )}
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {team.role && (
                        <span style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 99,
                          background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                          textTransform: 'capitalize',
                        }}>Your role: {team.role}</span>
                      )}
                      {team.last_message && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          <img src="/images/messages.png" alt="teams" width={'15px'} height={'15px'} style={{verticalAlign: 'middle'}}/> {team.last_message.slice(0, 35)}...
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Invitations tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
          {invitations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📬</div>
              <div className="empty-state-text">No pending invitations.</div>
            </div>
          ) : invitations.map(inv => (
            <div key={inv.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}><img src="/images/team.png" alt="teams" width={'24px'} height={'24px'}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{inv.team_name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-dark)', margin: '4px 0' }}>
                  Invited by <strong>{inv.inviter_name}</strong> ({inv.inviter_talent?.replace('_', ' ')}) · {formatTime(inv.created_at)}
                </div>
                {inv.team_description && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{inv.team_description}</div>
                )}
                {inv.message && (
                  <div style={{ marginTop: 8, fontSize: 13, fontStyle: 'italic', color: 'var(--text-dark)', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 'var(--radius)' }}>
                    "{inv.message}"
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-success btn-sm" onClick={() => handleInviteResponse(inv.id, 'accepted')}>Accept</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleInviteResponse(inv.id, 'rejected')}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Team">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {createError && <div className="alert alert-error">{createError}</div>}
          <div className="form-group">
            <label className="form-label">Team Name *</label>
            <input className="form-input" placeholder="e.g. NovaBuild, HealthTrack..." value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="What is your team building? What kind of talent are you looking for?" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} style={{ minHeight: 100 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createLoading}>
              {createLoading ? 'Creating...' : '✦ Create Team'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

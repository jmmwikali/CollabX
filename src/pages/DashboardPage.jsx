import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AppShell, Avatar, TalentBadge, RepBadge, formatTime, LoadingSpinner } from '../components/Layout';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    Promise.all([
      dashboardAPI.getDashboard(),
      teamsAPI.getMyInvitations(),
    ]).then(([dashRes, invRes]) => {
      setData(dashRes.data.dashboard);
      setInvitations(invRes.data.invitations || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleInviteResponse = async (inviteId, status) => {
    try {
      await teamsAPI.respondToInvitation(inviteId, status);
      setInvitations(prev => prev.filter(i => i.id !== inviteId));
    } catch (err) { console.error(err); }
  };

  const pendingInvites = invitations.length;
  const unreadDms = data?.unread_dms || 0;

  if (loading) return (
    <AppShell title="Dashboard">
      <LoadingSpinner size={36} />
    </AppShell>
  );

  const stats = data?.stats || {};

  return (
    <AppShell
      title="Dashboard"
      pendingInvites={pendingInvites}
      unreadDms={unreadDms}
      actions={
        <Link to="/explore" className="btn btn-primary btn-sm">
          <span><img src="/images/search.png" alt="search" width={"20px"} height={"20px"} /></span> Find Talent
        </Link>
      }
    >
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #2d5a8e)',
        border: '1px solid #2d5a8e',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <Avatar user={user} size={56} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 ,}}>
            Welcome {user?.name?.split(' ')[0]}! 👋
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{fontSize: '20px'}}><TalentBadge talent={user?.primary_talent}/></span>
            <RepBadge points={user?.reputation_points} />
            <span style={{ fontSize: 12, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {user?.skill_level} level
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, textAlign: 'center', }}>
          {[
            { label: 'Teams', value: stats.team_count || 0 },
            { label: 'Messages', value: stats.messages_sent || 0 },
            { label: 'Rep Points', value: (user?.reputation_points || 0).toLocaleString() },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-primary)', marginTop: 2, fontWeight: 700 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-header">
            <h3 className="section-title"><span><img src="/images/invitation.png" alt="invitation" width={"20px"} height={"20px"} style={{verticalAlign: 'middle'}} /></span> Team Invitations</h3>
            <span style={{ fontSize: 12, color: 'var(--accent-bright)', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 99 }}>
              {invitations.length} pending
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {invitations.map(inv => (
              <div key={inv.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-mid)' }}>{inv.team_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Invited by <strong>{inv.inviter_name}</strong> · {formatTime(inv.created_at)}
                  </div>
                  {inv.message && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>"{inv.message}"</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-success" onClick={() => handleInviteResponse(inv.id, 'accepted')}>Accept</button>
                  <button className="btn btn-sm btn-ghost2" onClick={() => handleInviteResponse(inv.id, 'rejected')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
          <div>
            <div className="section-header">
              <h3 className="section-title">🔔 Notifications</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data?.notifications || []).slice(0, 5).map(n => (
                <div key={n.id} className="card card-sm" style={{
                  opacity: n.is_read ? 0.6 : 1,
                  borderLeft: n.is_read ? 'none' : '2px solid var(--accent)',
                  padding: '12px 14px',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-mid)' }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{n.body.length > 70 ? `${n.body.slice(0, 70)}...` : n.body}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{formatTime(n.created_at)}</div>
                </div>
              ))}
              {(!data?.notifications || data.notifications.length === 0) && (
                <div style={{ color: 'var(--text-seconday)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  All caught up! 
                </div>
              )}
            </div>
          </div> <br />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

        
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* My Teams */}
          <div>
            <div className="section-header">
              <h3 className="section-title"><img src="/images/team.png" alt="teams" width={"30px"} height={"30px"} style={{verticalAlign: 'middle', marginRight: '6px'}} /> My Teams</h3>
              <Link to="/teams" style={{ fontSize: 13, color: 'var(--accent-bright)', textDecoration: 'none' }}>View all →</Link>
            </div>
            {data?.teams?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.teams.map(team => (
                  <Link key={team.id} to={`/teams/${team.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 'var(--radius)',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                      }}><img src="/images/team.png" alt="teams" width={"30px"} height={"30px"} style={{verticalAlign: 'middle', marginRight: '6px'}} /></div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{team.name}</div>
                        {/* FIX: Only append "..." if the message is actually truncated */}
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {team.member_count} members ·{' '}
                          {team.last_message
                            ? team.last_message.length > 40
                              ? `"${team.last_message.slice(0, 40)}..."`
                              : `"${team.last_message}"`
                            : 'No messages yet'}
                        </div>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatTime(team.last_activity)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}><img src="/images/team.png" alt="teams" width={"40px"} height={"40px"} style={{verticalAlign: 'middle', marginRight: '6px'}} /></div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>You're not in any teams yet.</div>
                <Link to="/teams" className="btn btn-primary btn-sm">Create a Team</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Suggested Talent */}
          <div>
            <div className="section-header">
              <h3 className="section-title"><img src="/images/stars.png" alt="stars" width={"20px"} height={"20px"} style={{verticalAlign: 'middle', marginRight: '6px'}} /> Suggested Talent</h3>
              <Link to="/explore" style={{ fontSize: 13, color: 'var(--accent-bright)', textDecoration: 'none' }}>Explore →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(data?.suggestions || []).slice(0, 5).map(person => (
                <div key={person.id} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={person} size={36} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-mid)' }}>{person.name}</div>
                    <TalentBadge talent={person.primary_talent} />
                  </div>
                  <RepBadge points={person.reputation_points} />
                </div>
              ))}
            </div>
          </div>

          
        </div>
      </div>
    </AppShell>
  );
}

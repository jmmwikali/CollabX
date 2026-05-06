import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { AppShell, Avatar, TalentBadge, RepBadge, LoadingSpinner } from '../components/Layout';
import { useLocation, useParams, Link } from 'react-router-dom';

export default function UserProfile() {
  const location = useLocation();
  const { id: paramId } = useParams();

  // Prefer router state for instant render (no flash), but always fetch
  // by ID so the page works on direct load / refresh and gets the teams list.
  const [u, setU] = useState(location.state?.u || null);
  const [loading, setLoading] = useState(!location.state?.u);
  const [error, setError] = useState('');

  // Resolve the user ID: from URL param if present, otherwise from router state
  const userId = paramId || location.state?.u?.id;

  useEffect(() => {
    if (!userId) return;
    usersAPI.getUserById(userId)
      .then(res => setU(res.data.user))
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [userId]);

  // Derive arrays safely from u
  const portfolioLinks = (() => {
    const raw = u?.portfolio_links;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
  })();

  const secondarySkills = (() => {
    const raw = u?.secondary_skills;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
  })();

  if (loading) return (
    <AppShell title="Profile">
      <LoadingSpinner size={36} />
    </AppShell>
  );

  if (error || !u) return (
    <AppShell title="Profile">
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <div className="empty-state-text">{error || 'User not found.'}</div>
        <Link to="/explore" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Back to Explore</Link>
      </div>
    </AppShell>
  );

  return (
    <AppShell title="Profile">

      {/* ── Top row: Profile card + Teams side by side ── */}
      <div className="profile-top-cols" style={{ marginBottom: 20 }}>

        {/* Profile card */}
        <div key={u.id} className="card profile-card-col">
          <div style={{ display: 'flex', gap: 12 }}>
            <Avatar user={u} size={48} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-mid)' }}>{u.name}</div>
              <TalentBadge talent={u.primary_talent} />
            </div>
          </div>
          {u.bio && (
            <p style={{
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              marginTop: 10,
            }}>{u.bio}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99 }}>
              {u.skill_level}
            </span>
            <RepBadge points={u.reputation_points} />
          </div>

          {/* Secondary skills */}
          {secondarySkills.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>SKILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {secondarySkills.map(skill => (
                  <span key={skill} style={{
                    fontSize: 12, padding: '3px 10px', borderRadius: 99,
                    background: 'var(--bg-glass)', color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {portfolioLinks.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700 }}>PORTFOLIO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {portfolioLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    🔗 {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="profile-teams-col" style={{
          background: 'linear-gradient(145deg,rgba(15, 22, 41, 0.85) 0%,rgba(4, 14, 35, 0.75) 100%)',
          padding: 14,
          borderRadius: 12,
          border: '1px solid #204d81',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 700 }}>TEAMS</div>
          {u.teams && u.teams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {u.teams.map(team => (
                <Link key={team.id} to={`/teams/${team.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius)',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <img src="/images/team.png" alt="team" width="20px" height="20px" />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-mid)' }}>{team.name}</div>
                      {team.description && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {team.description}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99, textTransform: 'capitalize', flexShrink: 0 }}>
                      {team.role}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Not in any teams yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid-3" style={{ gap: 16 }}>
        {[
          { icon: '/images/star(1).png', label: 'Reputation', value: u?.reputation_points?.toLocaleString() || '0' },
          { icon: '/images/calendar.png', label: 'Member Since', value: u?.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
          { icon: '/images/gmail.png', label: 'Email', value: u?.email || '—' },
        ].map(s => (
          <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
            <img src={s.icon} alt={s.label} style={{ width: 50, height: 50 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

    </AppShell>
  );
}
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { AppShell, Avatar, TalentBadge, RepBadge } from '../components/Layout';
import { useLocation } from 'react-router-dom';


export default function UserProfile() {

    const location = useLocation();
    const u = location.state?.u;

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

  return (
    <AppShell title="Profile">
      <div style={{ maxWidth: 700 }}>
        {/* Profile card */}
        <div key={u.id} className="card" style={{ marginBottom: 24 }}>
          <div >
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
                }}>{u.bio}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99 }}>
                {u.skill_level}
                </span>
                <RepBadge points={u.reputation_points} />
            </div>
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

            {/* Portfolio - was u.map(), should be portfolioLinks.map() */}
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

        {/* Stats */}
        <div className="grid-3" style={{ gap: 16, marginBottom: 24 }}>
          {[
            { icon: '/images/star(1).png', label: 'Reputation', value: u?.reputation_points?.toLocaleString() || '0' },
            { icon: '/images/calendar.png', label: 'Member Since', value: u?.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
            { icon: '/images/gmail.png', label: 'Email', value: u?.email || '—' },
          ].map(s => (
            <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
              <img src={s.icon} alt={s.label} style={{ width: 50, height: 50 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)'}}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        
      </div>
    </AppShell>
  );
}

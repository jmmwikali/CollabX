import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { AppShell, Avatar, TalentBadge, RepBadge } from '../components/Layout';

const TALENTS = ['frontend','backend','fullstack','designer','ui_ux','writer','marketer','devops','mobile','data_scientist','product_manager','other'];
const LEVELS = ['beginner','intermediate','advanced'];
const TALENT_LABELS = {
  frontend: '⚡ Frontend Dev', backend: '⚙️ Backend Dev', fullstack: '🔧 Full Stack',
  designer: '🎨 Designer', ui_ux: '✏️ UI/UX Designer', writer: '✍️ Writer',
  marketer: '📣 Marketer', devops: '🚀 DevOps', mobile: '📱 Mobile Dev',
  data_scientist: '📊 Data Scientist', product_manager: '🗺️ Product Manager', other: '💡 Other',
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    primary_talent: user?.primary_talent || 'other',
    skill_level: user?.skill_level || 'beginner',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true); setSaveStatus('');
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      setSaveStatus('success');
      setEditing(false);
      
      setTimeout(() => {setSaveStatus(''); }, 1000)
    } catch (err) {
      setSaveStatus(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const portfolioLinks = (() => {
    try { return typeof user?.portfolio_links === 'string' ? JSON.parse(user.portfolio_links) : user?.portfolio_links || []; }
    catch { return []; }
  })();

  const secondarySkills = (() => {
    try { return typeof user?.secondary_skills === 'string' ? JSON.parse(user.secondary_skills) : user?.secondary_skills || []; }
    catch { return []; }
  })();

  return (
    <AppShell title="Profile">
      <div style={{ maxWidth: 700 }}>
        {/* Edit form */}
        {editing && (
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20, color: 'var(--text-secondary)' }}>Edit Profile</h3>
            {saveStatus && saveStatus !== 'success' && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>{saveStatus}</div>
            )}
            {saveStatus === 'success' && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>Profile saved!</div>
            )}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Avatar URL</label>
                  <input className="form-input" placeholder="https://..." value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })} />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Primary Talent</label>
                  <select className="form-select" value={form.primary_talent} onChange={e => setForm({ ...form, primary_talent: e.target.value })}>
                    {TALENTS.map(t => <option key={t} value={t}>{TALENT_LABELS[t]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Skill Level</label>
                  <select className="form-select" value={form.skill_level} onChange={e => setForm({ ...form, skill_level: e.target.value })}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell the community about yourself..." />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )} <br />

        {/* Profile card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <Avatar user={user} size={80} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-mid)' }}>{user?.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                <TalentBadge talent={user?.primary_talent} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', background: 'var(--bg-elevated)', padding: '3px 10px', borderRadius: 99 }}>
                  {user?.skill_level} level
                </span>
                <RepBadge points={user?.reputation_points} />
              </div>
              {user?.bio && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{user.bio}</p>}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? (
                <>✕ Cancel</>
              ) : (
                <>
                  <img src="/images/edit.png" alt="edit" width={20} height={20} style={{ verticalAlign: 'middle', }} />
                  Edit
                </>
              )}
            </button>
          </div>

          {/* Secondary skills */}
          {secondarySkills.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 , fontWeight: 700}}>SKILLS</div>
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
                    fontSize: 13, color: 'var(--text-dark)', textDecoration: 'none',
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
            { icon: '/images/star(1).png', label: 'Reputation', value: user?.reputation_points?.toLocaleString() || '0' },
            { icon: '/images/calendar.png', label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—' },
            { icon: '/images/gmail.png', label: 'Email', value: user?.email || '—' },
          ].map(s => (
            <div key={s.label} className="card card-sm" style={{ textAlign: 'center' }}>
              <img src={s.icon} alt={s.label} style={{ width: 50, height: 50 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-dark)'}}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        
      </div>
    </AppShell>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const SKILL_OPTIONS = [
  'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML/CSS',
  'Node.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Express',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
  'Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Tailwind CSS',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'TensorFlow', 'PyTorch', 'Pandas', 'SQL',
  'Git', 'Linux', 'Agile', 'Scrum', 'SEO', 'Copywriting',
];

/* ── Avatar library ── */
// Using DiceBear avatar seeds — grouped by style for easy browsing.
// Format: { id, url, label }
const buildDicebear = (style, seed) =>
  `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

const AVATAR_CATEGORIES = [
  {
    label: 'Personas',
    avatars: [
      'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley',
      'Gray', 'Harper', 'Indigo', 'Jordan', 'Kai', 'Lane',
      'Morgan', 'Nova', 'Oakley', 'Parker', 'Quinn', 'Riley',
      'Sage', 'Taylor', 'Uma', 'Vesper', 'Winter', 'Xen',
    ].map(seed => ({ id: `personas-${seed}`, url: buildDicebear('personas', seed), label: seed })),
  },
  {
    label: 'Pixel Art',
    avatars: [
      'Pixel-1', 'Pixel-2', 'Pixel-3', 'Pixel-4', 'Pixel-5', 'Pixel-6',
      'Pixel-7', 'Pixel-8', 'Pixel-9', 'Pixel-10', 'Pixel-11', 'Pixel-12',
      'Pixel-13', 'Pixel-14', 'Pixel-15', 'Pixel-16', 'Pixel-17', 'Pixel-18',
      'Pixel-19', 'Pixel-20', 'Pixel-21', 'Pixel-22', 'Pixel-23', 'Pixel-24',
    ].map(seed => ({ id: `pixel-${seed}`, url: buildDicebear('pixel-art', seed), label: seed.replace('Pixel-', '#') })),
  },
  {
    label: 'Shapes',
    avatars: [
      'Shape-A', 'Shape-B', 'Shape-C', 'Shape-D', 'Shape-E', 'Shape-F',
      'Shape-G', 'Shape-H', 'Shape-I', 'Shape-J', 'Shape-K', 'Shape-L',
      'Shape-M', 'Shape-N', 'Shape-O', 'Shape-P', 'Shape-Q', 'Shape-R',
      'Shape-S', 'Shape-T', 'Shape-U', 'Shape-V', 'Shape-W', 'Shape-X',
    ].map(seed => ({ id: `shapes-${seed}`, url: buildDicebear('shapes', seed), label: seed.replace('Shape-', '#') })),
  },
  {
    label: 'Fun',
    avatars: [
      'Fun-1', 'Fun-2', 'Fun-3', 'Fun-4', 'Fun-5', 'Fun-6',
      'Fun-7', 'Fun-8', 'Fun-9', 'Fun-10', 'Fun-11', 'Fun-12',
      'Fun-13', 'Fun-14', 'Fun-15', 'Fun-16', 'Fun-17', 'Fun-18',
      'Fun-19', 'Fun-20', 'Fun-21', 'Fun-22', 'Fun-23', 'Fun-24',
    ].map(seed => ({ id: `fun-${seed}`, url: buildDicebear('fun-emoji', seed), label: seed.replace('Fun-', '#') })),
  },
];

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /* ── Step 1: Skills ── */
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
    }
    setCustomSkill('');
  };

  const handleCustomKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); }
  };

  /* ── Step 2: Avatar ── */
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);

  /* ── Step 3: Portfolio ── */
  const [portfolioLinks, setPortfolioLinks] = useState(['']);

  const updateLink = (i, val) => {
    setPortfolioLinks(prev => prev.map((l, idx) => idx === i ? val : l));
  };

  const addLink = () => setPortfolioLinks(prev => [...prev, '']);

  const removeLink = (i) => {
    setPortfolioLinks(prev => prev.filter((_, idx) => idx !== i));
  };

  /* ── Submit ── */
  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      const cleanLinks = portfolioLinks.map(l => l.trim()).filter(Boolean);
      const res = await authAPI.updateProfile({
        name: user?.name,
        bio: user?.bio || null,
        primary_talent: user?.primary_talent,
        skill_level: user?.skill_level,
        secondary_skills: selectedSkills.length ? selectedSkills : null,
        portfolio_links: cleanLinks.length ? cleanLinks : null,
        avatar_url: selectedAvatar?.url || user?.avatar_url || null,
      });
      updateUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  const skipToNext = () => {
    if (step < 3) setStep(s => s + 1);
    else navigate('/dashboard');
  };

  /* ── Progress bar width ── */
  const progress = step === 1 ? '33%' : step === 2 ? '66%' : '100%';

  const currentCategory = AVATAR_CATEGORIES[activeCategory];

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoText}>
              Collab<span style={styles.logoX}>X</span>
            </span>
          </div>
          <div style={styles.stepLabel}>Step {step} of 3</div>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: progress }} />
        </div>

        {/* Step title */}
        <div style={styles.stepHeader}>
          {step === 1 && (
            <>
              <h2 style={styles.title}>What are your skills?</h2>
              <p style={styles.subtitle}>
                Select skills that complement your primary talent. This helps us match you with the right teammates.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h2 style={styles.title}>Pick your avatar</h2>
              <p style={styles.subtitle}>
                Choose a profile picture that represents you. You can always change it later.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h2 style={styles.title}>Share your work</h2>
              <p style={styles.subtitle}>
                Add links to your portfolio, GitHub, Behance, LinkedIn, or any projects you're proud of.
              </p>
            </>
          )}
        </div>

        {/* ── STEP 1: Skills ── */}
        {step === 1 && (
          <div style={styles.body}>
            <div style={styles.chipsGrid}>
              {SKILL_OPTIONS.map(skill => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}
                  >
                    {active && <span style={styles.chipCheck}>✓ </span>}
                    {skill}
                  </button>
                );
              })}
            </div>

            <div style={styles.customRow}>
              <input
                style={styles.input}
                placeholder="Add a custom skill…"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={handleCustomKeyDown}
              />
              <button style={styles.addBtn} onClick={addCustomSkill} disabled={!customSkill.trim()}>
                + Add
              </button>
            </div>

            {selectedSkills.filter(s => !SKILL_OPTIONS.includes(s)).length > 0 && (
              <div style={styles.customChips}>
                {selectedSkills.filter(s => !SKILL_OPTIONS.includes(s)).map(s => (
                  <span key={s} style={styles.customChip}>
                    {s}
                    <button style={styles.chipRemove} onClick={() => toggleSkill(s)}>×</button>
                  </span>
                ))}
              </div>
            )}

            <div style={styles.selectedCount}>
              {selectedSkills.length > 0
                ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                : 'No skills selected yet'}
            </div>
          </div>
        )}

        {/* ── STEP 2: Avatar ── */}
        {step === 2 && (
          <div style={styles.body}>
            {/* Selected avatar preview */}
            <div style={styles.avatarPreviewRow}>
              <div style={styles.avatarPreviewBubble}>
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar.url}
                    alt="Selected avatar"
                    style={styles.avatarPreviewImg}
                  />
                ) : (
                  <span style={styles.avatarPreviewPlaceholder}>?</span>
                )}
              </div>
              <div style={styles.avatarPreviewInfo}>
                {selectedAvatar ? (
                  <>
                    <span style={styles.avatarPreviewName}>{selectedAvatar.label}</span>
                    <span style={styles.avatarPreviewSub}>Looking good! 👌</span>
                  </>
                ) : (
                  <>
                    <span style={styles.avatarPreviewName}>No avatar yet</span>
                    <span style={styles.avatarPreviewSub}>Pick one from the grid below</span>
                  </>
                )}
              </div>
            </div>

            {/* Category tabs */}
            <div style={styles.categoryTabs}>
              {AVATAR_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.label}
                  style={{
                    ...styles.categoryTab,
                    ...(activeCategory === idx ? styles.categoryTabActive : {}),
                  }}
                  onClick={() => setActiveCategory(idx)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Avatar grid */}
            <div style={styles.avatarGrid}>
              {currentCategory.avatars.map(avatar => {
                const isSelected = selectedAvatar?.id === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(isSelected ? null : avatar)}
                    style={{
                      ...styles.avatarCell,
                      ...(isSelected ? styles.avatarCellActive : {}),
                    }}
                    title={avatar.label}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.label}
                      style={styles.avatarImg}
                      loading="lazy"
                    />
                    {isSelected && (
                      <div style={styles.avatarCheckOverlay}>
                        <span style={styles.avatarCheckMark}>✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p style={styles.avatarHint}>
              {selectedAvatar
                ? `Selected: ${selectedAvatar.label}`
                : `${AVATAR_CATEGORIES.reduce((n, c) => n + c.avatars.length, 0)} avatars across ${AVATAR_CATEGORIES.length} styles`}
            </p>
          </div>
        )}

        {/* ── STEP 3: Portfolio ── */}
        {step === 3 && (
          <div style={styles.body}>
            {portfolioLinks.map((link, i) => (
              <div key={i} style={styles.linkRow}>
                <span style={styles.linkIcon}>🔗</span>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="https://github.com/you, behance.net/you, …"
                  value={link}
                  onChange={e => updateLink(i, e.target.value)}
                  type="url"
                />
                {portfolioLinks.length > 1 && (
                  <button style={styles.removeBtn} onClick={() => removeLink(i)}>×</button>
                )}
              </div>
            ))}

            {portfolioLinks.length < 6 && (
              <button style={styles.addLinkBtn} onClick={addLink}>
                + Add another link
              </button>
            )}

            {error && (
              <div style={styles.errorBox}>⚠️ {error}</div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div style={styles.footer}>
          <button style={styles.skipBtn} onClick={skipToNext} disabled={saving}>
            {step === 3 ? 'Skip' : 'Skip for now'}
          </button>

          {step < 3 ? (
            <button style={styles.nextBtn} onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          ) : (
            <button style={styles.nextBtn} onClick={handleFinish} disabled={saving}>
              {saving ? 'Saving…' : '🚀 Go to Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Inline styles ── */
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2b506c, #1e3a54)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.97)',
    borderRadius: 20,
    width: '100%',
    maxWidth: 620,
    boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  header: {
    background: '#0b2233',
    padding: '22px 32px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 20,
    fontWeight: 800,
    color: '#dff6ff',
    letterSpacing: '-0.5px',
  },
  logoX: {
    background: 'linear-gradient(135deg, #9DD9FD, #B9E2FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#afc3d0',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 3,
    background: 'rgba(0,0,0,0.08)',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #9DD9FD, #00b8cc)',
    transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
  },
  stepHeader: {
    padding: '28px 32px 0',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22,
    fontWeight: 800,
    color: '#0b2233',
    marginBottom: 8,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: 14,
    color: '#3d5c70',
    lineHeight: 1.6,
  },
  body: {
    padding: '22px 32px',
  },

  /* Skills */
  chipsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    padding: '6px 14px',
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid rgba(0,0,0,0.12)',
    background: 'rgba(0,0,0,0.04)',
    color: '#3d5c70',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  chipActive: {
    background: 'linear-gradient(135deg, #B9E2FF, #9DD9FD)',
    borderColor: '#00b8cc',
    color: '#0b2233',
    fontWeight: 600,
  },
  chipCheck: {
    fontWeight: 700,
    color: '#007b8a',
  },
  customRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    background: 'rgba(185,226,255,0.15)',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: 10,
    color: '#01121e',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  addBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    background: '#0b2233',
    color: '#9DD9FD',
    border: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s ease',
  },
  customChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  customChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #B9E2FF, #9DD9FD)',
    color: '#0b2233',
    border: '1px solid #00b8cc',
  },
  chipRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    lineHeight: 1,
    color: '#007b8a',
    padding: '0 1px',
    fontWeight: 700,
  },
  selectedCount: {
    fontSize: 12,
    color: '#3d5c70',
    fontWeight: 500,
  },

  /* Avatar step */
  avatarPreviewRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    padding: '14px 16px',
    borderRadius: 14,
    background: 'rgba(157,217,253,0.1)',
    border: '1px solid rgba(0,184,204,0.15)',
  },
  avatarPreviewBubble: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #B9E2FF, #9DD9FD)',
    border: '2px solid #00b8cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarPreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPreviewPlaceholder: {
    fontSize: 22,
    fontWeight: 800,
    color: '#007b8a',
    fontFamily: "'Syne', sans-serif",
  },
  avatarPreviewInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  avatarPreviewName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0b2233',
  },
  avatarPreviewSub: {
    fontSize: 12,
    color: '#3d5c70',
  },
  categoryTabs: {
    display: 'flex',
    gap: 6,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryTab: {
    padding: '6px 14px',
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid rgba(0,0,0,0.12)',
    background: 'rgba(0,0,0,0.04)',
    color: '#3d5c70',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s ease',
    letterSpacing: '0.02em',
  },
  categoryTabActive: {
    background: '#0b2233',
    borderColor: '#0b2233',
    color: '#9DD9FD',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: 8,
    maxHeight: 260,
    overflowY: 'auto',
    padding: '4px 2px',
    // custom scrollbar hint — webkit only
    scrollbarWidth: 'thin',
  },
  avatarCell: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 10,
    border: '2px solid transparent',
    background: 'rgba(0,0,0,0.04)',
    cursor: 'pointer',
    overflow: 'hidden',
    padding: 0,
    transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
  },
  avatarCellActive: {
    borderColor: '#00b8cc',
    boxShadow: '0 0 0 3px rgba(0,184,204,0.2)',
    transform: 'scale(1.05)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
  },
  avatarCheckOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,184,204,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  avatarCheckMark: {
    fontSize: 16,
    fontWeight: 800,
    color: '#fff',
    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
  },
  avatarHint: {
    fontSize: 11.5,
    color: '#3d5c70',
    marginTop: 10,
    fontWeight: 500,
  },

  /* Portfolio */
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  linkIcon: {
    fontSize: 18,
    flexShrink: 0,
  },
  removeBtn: {
    background: 'none',
    border: '1px solid rgba(179,95,95,0.3)',
    borderRadius: 8,
    color: '#c49090',
    fontSize: 18,
    lineHeight: 1,
    padding: '6px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s ease',
  },
  addLinkBtn: {
    background: 'none',
    border: '1px dashed rgba(0,184,204,0.4)',
    borderRadius: 10,
    color: '#007b8a',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 0',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.15s ease, border-color 0.15s ease',
  },
  errorBox: {
    marginTop: 12,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(179,95,95,0.1)',
    border: '1px solid rgba(179,95,95,0.22)',
    color: '#c49090',
    fontSize: 13.5,
  },

  /* Footer */
  footer: {
    padding: '0 32px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(0,0,0,0.06)',
    paddingTop: 20,
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#3d5c70',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13.5,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 4px',
    transition: 'color 0.15s ease',
  },
  nextBtn: {
    background: '#0b2233',
    color: '#9DD9FD',
    border: 'none',
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    padding: '11px 28px',
    cursor: 'pointer',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    letterSpacing: '0.01em',
  },
};
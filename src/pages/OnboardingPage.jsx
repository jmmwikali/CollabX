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
    <div className="onboarding-page">
      <div className="onboarding-card">

        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo-row">
            <span className="onboarding-logo-text">
              Collab<span className="onboarding-logo-x">X</span>
            </span>
          </div>
          <div className="onboarding-step-label">Step {step} of 3</div>
        </div>

        {/* Progress bar */}
        <div className="onboarding-progress-track">
          <div className="onboarding-progress-fill" style={{ width: progress }} />
        </div>

        {/* Step title */}
        <div className="onboarding-step-header">
          {step === 1 && (
            <>
              <h2 className="onboarding-title">What are your skills?</h2>
              <p className="onboarding-subtitle">
                Select skills that complement your primary talent. This helps us match you with the right teammates.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="onboarding-title">Pick your avatar</h2>
              <p className="onboarding-subtitle">
                Choose a profile picture that represents you. You can always change it later.
              </p>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="onboarding-title">Share your work</h2>
              <p className="onboarding-subtitle">
                Add links to your portfolio, GitHub, Behance, LinkedIn, or any projects you're proud of.
              </p>
            </>
          )}
        </div>

        {/* ── STEP 1: Skills ── */}
        {step === 1 && (
          <div className="onboarding-body">
            <div className="ob-chips-grid">
              {SKILL_OPTIONS.map(skill => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`ob-chip${active ? ' ob-chip--active' : ''}`}
                  >
                    {active && <span className="ob-chip-check">✓ </span>}
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="ob-custom-row">
              <input
                className="form-input"
                placeholder="Add a custom skill…"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={handleCustomKeyDown}
              />
              <button className="btn btn-dark btn-sm" onClick={addCustomSkill} disabled={!customSkill.trim()}>
                + Add
              </button>
            </div>

            {selectedSkills.filter(s => !SKILL_OPTIONS.includes(s)).length > 0 && (
              <div className="ob-custom-chips">
                {selectedSkills.filter(s => !SKILL_OPTIONS.includes(s)).map(s => (
                  <span key={s} className="ob-custom-chip">
                    {s}
                    <button className="ob-chip-remove" onClick={() => toggleSkill(s)}>×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="ob-selected-count">
              {selectedSkills.length > 0
                ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                : 'No skills selected yet'}
            </div>
          </div>
        )}

        {/* ── STEP 2: Avatar ── */}
        {step === 2 && (
          <div className="onboarding-body">
            {/* Selected avatar preview */}
            <div className="ob-avatar-preview-row">
              <div className="ob-avatar-preview-bubble">
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar.url}
                    alt="Selected avatar"
                    className="ob-avatar-preview-img"
                  />
                ) : (
                  <span className="ob-avatar-preview-placeholder">?</span>
                )}
              </div>
              <div className="ob-avatar-preview-info">
                {selectedAvatar ? (
                  <>
                    <span className="ob-avatar-preview-name">{selectedAvatar.label}</span>
                    <span className="ob-avatar-preview-sub">Looking good! 👌</span>
                  </>
                ) : (
                  <>
                    <span className="ob-avatar-preview-name">No avatar yet</span>
                    <span className="ob-avatar-preview-sub">Pick one from the grid below</span>
                  </>
                )}
              </div>
            </div>

            {/* Category tabs */}
            <div className="ob-category-tabs">
              {AVATAR_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.label}
                  className={`ob-category-tab${activeCategory === idx ? ' ob-category-tab--active' : ''}`}
                  onClick={() => setActiveCategory(idx)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Avatar grid */}
            <div className="ob-avatar-grid">
              {currentCategory.avatars.map(avatar => {
                const isSelected = selectedAvatar?.id === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(isSelected ? null : avatar)}
                    className={`ob-avatar-cell${isSelected ? ' ob-avatar-cell--active' : ''}`}
                    title={avatar.label}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.label}
                      className="ob-avatar-img"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="ob-avatar-check-overlay">
                        <span className="ob-avatar-check-mark">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="ob-avatar-hint">
              {selectedAvatar
                ? `Selected: ${selectedAvatar.label}`
                : `${AVATAR_CATEGORIES.reduce((n, c) => n + c.avatars.length, 0)} avatars across ${AVATAR_CATEGORIES.length} styles`}
            </p>
          </div>
        )}

        {/* ── STEP 3: Portfolio ── */}
        {step === 3 && (
          <div className="onboarding-body">
            {portfolioLinks.map((link, i) => (
              <div key={i} className="ob-link-row">
                <span className="ob-link-icon">🔗</span>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="https://github.com/you, behance.net/you, …"
                  value={link}
                  onChange={e => updateLink(i, e.target.value)}
                  type="url"
                />
                {portfolioLinks.length > 1 && (
                  <button className="ob-remove-btn" onClick={() => removeLink(i)}>×</button>
                )}
              </div>
            ))}

            {portfolioLinks.length < 6 && (
              <button className="ob-add-link-btn" onClick={addLink}>
                + Add another link
              </button>
            )}

            {error && (
              <div className="alert alert-error" style={{ marginTop: 12 }}>⚠️ {error}</div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="onboarding-footer">
          <button className="btn btn-ghost" onClick={skipToNext} disabled={saving}>
            {step === 3 ? 'Skip' : 'Skip for now'}
          </button>

          {step < 3 ? (
            <button className="btn btn-primary btn-lg" onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleFinish} disabled={saving}>
              {saving ? 'Saving…' : '🚀 Go to Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/AuthLayout.css';

/* ─── Talent / level data (unchanged from RegisterPage) ─── */
const TALENTS = ['frontend','backend','fullstack','designer','ui_ux','writer','marketer','devops','mobile','data_scientist','product_manager','other'];
const LEVELS  = ['beginner','intermediate','advanced'];
const TALENT_LABELS = {
  frontend:'⚡ Frontend Dev', backend:'⚙️ Backend Dev', fullstack:'🔧 Full Stack',
  designer:'🎨 Designer', ui_ux:'✏️ UI/UX Designer', writer:'✍️ Writer',
  marketer:'📣 Marketer', devops:'🚀 DevOps', mobile:'📱 Mobile Dev',
  data_scientist:'📊 Data Scientist', product_manager:'🗺️ Product Manager', other:'💡 Other',
};

export default function AuthLayout() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
 const [isRegister, setIsRegister] = useState(window.location.pathname === '/register');

  /* ── Login state (unchanged) ── */
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLoginChange = e => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleLoginSubmit = async e => {
    e.preventDefault();
    setLoginError(''); setLoginLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const fillDemo = () => setLoginForm({ email: 'demo@collabx.com', password: 'password123' });

  /* ── Register state (unchanged) ── */
  const [regForm, setRegForm] = useState({
    name:'', email:'', password:'', primary_talent:'frontend', skill_level:'beginner', bio:'',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleRegChange = e => setRegForm({ ...regForm, [e.target.name]: e.target.value });

  const handleRegSubmit = async e => {
    e.preventDefault();
    setRegError(''); setRegLoading(true);
    try {
      await register(regForm);
      navigate('/onboarding');
    } catch (err) {
      console.log('Register error:', err.response?.data);
      setRegError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container${isRegister ? ' active' : ''}`}>

        {/* ══ OVERLAY ══ */}
        <div className="overlay" />

        {/* ════════════════════════════════
            DARK PANEL — Forms
        ════════════════════════════════ */}
        <div className="panel panel-dark">

          {/* ── LOGIN FORM ── */}
          <div className="panel-inner form-content-login" style={{ overflowY: 'auto' }}>
            <Link to="/" className="auth-logo">
              <img src="/images/CollabX(white).png" alt="logo" />
              Collab<span className="x-accent">X</span>
            </Link>

            <h2 className="auth-heading">Welcome back</h2>
            <p className="auth-sub">Sign in to your CollabX account</p>

            {loginError && <div className="auth-alert">⚠️ {loginError}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" name="email"
                  placeholder="you@example.com"
                  value={loginForm.email} onChange={handleLoginChange} required />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input className="auth-input" type="password" name="password"
                  placeholder="Your password"
                  value={loginForm.password} onChange={handleLoginChange} required />
              </div>

              <button className="btn-main btn-primary" type="submit" disabled={loginLoading} style={{ marginTop: 8 }}>
                {loginLoading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <button className="btn-main btn-ghost" onClick={fillDemo}>
              🎭 Use Demo Account
            </button>

            <div className="auth-divider"><span>or</span></div>
            <p className="auth-footer-text">
              No account?{' '}
              <button className="auth-link" onClick={() => setIsRegister(true)}>
                Create one free →
              </button>
            </p>
          </div>

          {/* ── REGISTER FORM ── */}
          <div className="panel-inner form-content-register">
            <Link to="/" className="auth-logo">
              <img src="/images/CollabX(white).png" alt="logo" />
              Collab<span className="x-accent">X</span>
            </Link>

            <h2 className="auth-heading">Create account</h2>
            <p className="auth-sub">Join CollabX and start building great teams</p>

            {regError && <div className="auth-alert">⚠️ {regError}</div>}

            <div className="register-scroll">
              <form onSubmit={handleRegSubmit}>
                <div className="field-row">
                  <div className="auth-field">
                    <label className="auth-label">Full Name</label>
                    <input className="auth-input" name="name"
                      placeholder="Alex Chen"
                      value={regForm.name} onChange={handleRegChange} required />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <input className="auth-input" type="email" name="email"
                      placeholder="you@example.com"
                      value={regForm.email} onChange={handleRegChange} required />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <input className="auth-input" type="password" name="password"
                    placeholder="Minimum 6 characters"
                    value={regForm.password} onChange={handleRegChange}
                    required minLength={6} />
                </div>

                <div className="field-row">
                  <div className="auth-field">
                    <label className="auth-label">Primary Talent</label>
                    <select className="auth-select" name="primary_talent"
                      value={regForm.primary_talent} onChange={handleRegChange}>
                      {TALENTS.map(t => <option key={t} value={t}>{TALENT_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Skill Level</label>
                    <select className="auth-select" name="skill_level"
                      value={regForm.skill_level} onChange={handleRegChange}>
                      {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label">
                    Bio <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <textarea className="auth-textarea auth-input" name="bio"
                    placeholder="Tell the community a bit about yourself…"
                    value={regForm.bio} onChange={handleRegChange} />
                </div>

                <button className="btn-main btn-primary" type="submit" disabled={regLoading} style={{ marginTop: 4 }}>
                  {regLoading ? 'Creating account…' : 'Create Account →'}
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>
              <p className="auth-footer-text">
                Already have an account?{' '}
                <button className="auth-link" onClick={() => setIsRegister(false)}>
                  Sign in →
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            BRIGHT PANEL — Welcome
        ════════════════════════════════ */}
        <div className="panel panel-bright">

          {/* Login welcome */}
          <div className="panel-inner welcome-inner welcome-login">
            <div className="welcome-badge">✦ Already a member?</div>
            <h2 className="welcome-heading">
              Good to have<br /><em>you back.</em>
            </h2>
            <p className="welcome-body">
              Sign in to your CollabX account to reconnect with your team, check progress, and keep building without slowing down.
            </p>
            <button className="welcome-cta" onClick={() => setIsRegister(true)}>
              New here? Join free →
            </button>
            <div className="welcome-features">
              <div className="welcome-feature"><span className="feature-dot" />Pick up right where you left off</div>
              <div className="welcome-feature"><span className="feature-dot" />See what your teammates have shipped</div>
              <div className="welcome-feature"><span className="feature-dot" />Stay in sync with your team and tasks</div>
            </div>
          </div>

          {/* Register welcome */}
          <div className="panel-inner welcome-inner welcome-register">
            <div className="welcome-badge">✦ CollabX Platform</div>
            <h2 className="welcome-heading">
              Build together,<br /><em>ship faster.</em>
            </h2>
            <p className="welcome-body">
              Discover talented collaborators, form dream teams, and bring your ideas to life with people who share your vision.
            </p>
            <button className="welcome-cta" onClick={() => setIsRegister(false)}>
              ← Sign in instead
            </button>
            <div className="welcome-features">
              <div className="welcome-feature"><span className="feature-dot" />Find teammates based on skills and roles</div>
              <div className="welcome-feature"><span className="feature-dot" />Collaborate smoothly in one shared space</div>
              <div className="welcome-feature"><span className="feature-dot" />Showcase your work to the community</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const talentEmoji = {
  frontend: '/images/frontend.png',
  backend: '/images/backend.png',
  fullstack: '/images/fullstack.png',
  designer: '/images/designer.png',
  ui_ux: '/images/ui-ux.png',
  writer: '/images/writer(2).png',
  marketer: '/images/marketer(2).png',
  devops: '/images/developers.png',
  mobile: '/images/mobile-dev.png',
  data_scientist: '/images/data-scientist.png',
  product_manager: '/images/product-manager.png',
  other: '/images/other.png',
};

export const talentLabel = {
  frontend: 'Frontend Dev',
  backend: 'Backend Dev',
  fullstack: 'Full Stack Dev',
  designer: 'Designer',
  ui_ux: 'UI/UX Designer',
  writer: 'Writer',
  marketer: 'Marketer',
  devops: 'DevOps',
  mobile: 'Mobile Dev',
  data_scientist: 'Data Scientist',
  product_manager: 'Product Manager',
  other: 'Other',
};

export function Avatar({ user, size = 36, className = '' }) {
  const name = user?.name || '?';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={name}
        className={`avatar ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => { e.target.style.display='none'; }}
      />
    );
  }
  return (
    <div className={`avatar-fallback ${className}`} style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

export function TalentBadge({ talent }) {
  if (!talent) return null;
  return (
    <span className={`talent-badge talent-${talent}`}>
      <img 
        src={talentEmoji[talent]} 
        alt={talent} 
        width={16} 
        height={16} 
        style={{ objectFit: 'contain', verticalAlign: 'middle' }} 
      />
      {' '}{talentLabel[talent] || talent}
    </span>
  );
}

export function RepBadge({ points }) {
  return <span className="rep-badge">⭐ {points?.toLocaleString() || 0}</span>;
}

export function Sidebar({ pendingInvites = 0, unreadDms = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-logo">
        <img src="/images/CollabX(white).png" alt="logo" width={"30px"} height={"30px"} />
        Collab<span className="logo-x">X</span>
      </NavLink>

      <nav className="sidebar-nav">
        <span className="nav-section-label">Main</span>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><img src="/images/home.png" alt="home" width={"19px"} height={"19px"} /></span> Dashboard
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><img src="/images/people.png" alt="people" width={"19px"} height={"19px"} /></span> Explore Talent
        </NavLink>

        <span className="nav-section-label">Workspace</span>
        <NavLink to="/teams" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><img src="/images/team.png" alt="teams" width={"19px"} height={"19px"} /></span> My Teams
          {pendingInvites > 0 && <span className="nav-badge">{pendingInvites}</span>}
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><img src="/images/messages.png" alt="messages" width={"19px"} height={"19px"} /></span> Messages
          {unreadDms > 0 && <span className="nav-badge">{unreadDms}</span>}
        </NavLink>

        <span className="nav-section-label">Account</span>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon"><img src="/images/user.png" alt="profile" width={"19px"} height={"19px"} /></span> Profile
        </NavLink>
        <button className="nav-item" onClick={handleLogout}>
          <span className="nav-icon"><img src="/images/logout.png" alt="logout" width={"19px"} height={"19px"} /></span> Log Out
        </button>
      </nav>

      {user && (
        <div className="sidebar-user">
          <Avatar user={user} size={34} />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{talentLabel[user.primary_talent] || 'Member'}</div>
          </div>
        </div>
      )}
    </aside>
  );
}

export function AppShell({ children, title, actions, pendingInvites = 0, unreadDms = 0 }) {
  return (
    <div className="app-shell">
      <Sidebar pendingInvites={pendingInvites} unreadDms={unreadDms} />
      <div className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-actions">{actions}</div>
        </header>
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}

export function UserCard({ user, onInvite, compact = false }) {
  return (
    <div className="card user-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar user={user} size={44} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{user.name}</div>
          <TalentBadge talent={user.primary_talent} />
        </div>
        <RepBadge points={user.reputation_points} />
      </div>
      {!compact && user.bio && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {user.bio}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {user.skill_level}
        </span>
        {onInvite && (
          <button className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => onInvite(user)}>
            + Invite
          </button>
        )}
      </div>
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="loader-ring" style={{ width: size, height: size }} />
    </div>
  );
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return date.toLocaleDateString();
}

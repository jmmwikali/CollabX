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

export function Avatar({ user, size = 36, className = '', isOnline = false }) {
  const name = user?.name || '?';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const dot = isOnline ? (
    <span style={{
      position: 'absolute', bottom: 1, right: 1,
      width: size * 0.28, height: size * 0.28,
      background: '#22c55e', borderRadius: '50%',
      border: '1px solid var(--bg-surface, #000)',
    }} />
  ) : null;

  const wrapper = (child) => (
    <div style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      {child}{dot}
    </div>
  );

  if (user?.avatar_url) {
    return wrapper(
      <img src={user.avatar_url} alt={name} className={`avatar ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => { e.target.style.display = 'none'; }} />
    );
  }
  return wrapper(
    <div className={`avatar-fallback ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
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

export function Sidebar({ pendingInvites = 0, unreadDms = 0, collapsed = false, onCollapsedChange }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed);
  };

  // Reusable nav item that adapts to collapsed state
  const NavItem = ({ to, iconSrc, iconAlt, label, badge }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${collapsed ? ' nav-item--icon-only' : ''}`}
      title={collapsed ? label : undefined}
    >
      <span className="nav-icon">
        <img src={iconSrc} alt={iconAlt} width="19px" height="19px" />
      </span>
      {!collapsed && label}
      {badge > 0 && (
        collapsed
          ? <span className="nav-badge nav-badge--dot" />
          : <span className="nav-badge">{badge}</span>
      )}
    </NavLink>
  );

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>

      {/* Logo row with collapse toggle */}
      <div className="sidebar-logo-row">
        <NavLink
          to="/dashboard"
          className={`sidebar-logo${collapsed ? ' sidebar-logo--icon-only' : ''}`}
          title={collapsed ? 'CollabX' : undefined}
        >
          {!collapsed && <img src="/images/CollabX(white).png" alt="logo" width="25px" height="25px" />}
          {!collapsed && <>Collab<span className="logo-x">X</span></>}
        </NavLink>

        <button
          className="sidebar-collapse-btn"
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <img src="/images/collapse.png" width="25px" height="25px" style={{ opacity: 0.6, transition: 'transform var(--transition-slow)', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <span className="nav-section-label">Main</span>}
        <NavItem to="/dashboard" iconSrc="/images/home.png"    iconAlt="home"   label="Dashboard"     />
        <NavItem to="/explore"   iconSrc="/images/people.png"  iconAlt="people" label="Explore Talent" />

        {!collapsed && <span className="nav-section-label">Workspace</span>}
        <NavItem to="/teams"    iconSrc="/images/team.png"     iconAlt="teams"    label="My Teams"   badge={pendingInvites} />
        <NavItem to="/messages" iconSrc="/images/messages.png" iconAlt="messages" label="Messages"   badge={unreadDms} />
        <NavItem to="/social"   iconSrc="/images/social.png"   iconAlt="social"   label="Social Hub" />

        {!collapsed && <span className="nav-section-label">Account</span>}
        <NavItem to="/profile" iconSrc="/images/user.png" iconAlt="profile" label="Profile" />

        <button
          className={`nav-item${collapsed ? ' nav-item--icon-only' : ''}`}
          onClick={handleLogout}
          title={collapsed ? 'Log Out' : undefined}
        >
          <span className="nav-icon">
            <img src="/images/logout.png" alt="logout" width="19px" height="19px" />
          </span>
          {!collapsed && 'Log Out'}
        </button>
      </nav>

      {user && (
        <div className={`sidebar-user${collapsed ? ' sidebar-user--collapsed' : ''}`}>
          <Avatar user={user} size={34} />
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{talentLabel[user.primary_talent] || 'Member'}</div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export function BottomNav({ pendingInvites = 0, unreadDms = 0 }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: '/dashboard', icon: '/images/home.png', label: 'Home' },
    { to: '/explore',   icon: '/images/people.png', label: 'Explore' },
    { to: '/teams',     icon: '/images/team.png',   label: 'Teams',    badge: pendingInvites },
    { to: '/messages',  icon: '/images/messages.png', label: 'Messages', badge: unreadDms },
    { to: '/social',    icon: '/images/social.png', label: 'Social' },
    { to: '/profile',   icon: '/images/user.png',   label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          {item.badge > 0 && (
            <span className="bottom-nav-badge">{item.badge}</span>
          )}
          <img src={item.icon} alt={item.label} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell({ children, title, actions, pendingInvites = 0, unreadDms = 0 }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );

  const handleCollapsedChange = (val) => {
    setSidebarCollapsed(val);
    localStorage.setItem('sidebarCollapsed', val);
  };

  return (
    <div className={`app-shell${sidebarCollapsed ? ' sidebar-is-collapsed' : ''}`}>
      <Sidebar
        pendingInvites={pendingInvites}
        unreadDms={unreadDms}
        collapsed={sidebarCollapsed}
        onCollapsedChange={handleCollapsedChange}
      />
      <div className="main-content">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-actions">{actions}</div>
        </header>
        <main className="page-body">{children}</main>
      </div>
      <BottomNav pendingInvites={pendingInvites} unreadDms={unreadDms} />
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
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 18, color: "var(--text-tertiary)"}}>✕</button>
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
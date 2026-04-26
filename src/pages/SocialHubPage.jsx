import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppShell, LoadingSpinner } from '../components/Layout';
import { socialAPI } from '../services/socialAPI';
import { useAuth } from '../context/AuthContext';
import TeamInviteModule from '../components/social/TeamInviteModule';
import SkillExchangeModule from '../components/social/SkillExchangeModule';
import ChallengesModule from '../components/social/ChallengesModule';
import PollsModule from '../components/social/PollsModule';

const TABS = [
  { key: 'all',           label: 'All',             icon: '🌐' },
  { key: 'team_invite',   label: 'Team Invitations', icon: '🧑‍🤝‍🧑' },
  { key: 'skill_exchange',label: 'Skill Exchange',   icon: '🔁' },
  { key: 'challenge',     label: 'Challenges',       icon: '⚔️' },
  { key: 'poll',          label: 'Polls',            icon: '📊' },
];

export default function SocialHubPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const offsetRef = useRef(0);
  const LIMIT = 20;

  const fetchPosts = useCallback(async (tab, reset = false) => {
    const offset = reset ? 0 : offsetRef.current;
    if (!reset && !hasMore) return;

    reset ? setLoading(true) : setLoadingMore(true);
    setError('');
    try {
      const params = { limit: LIMIT, offset };
      if (tab !== 'all') params.type = tab;
      const res = await socialAPI.getFeed(params);
      const fetched = res.data.posts || [];

      if (reset) {
        setPosts(fetched);
        offsetRef.current = fetched.length;
      } else {
        setPosts(prev => [...prev, ...fetched]);
        offsetRef.current = offset + fetched.length;
      }
      setHasMore(fetched.length === LIMIT);
    } catch {
      setError('Failed to load posts. Please try again.');
    } finally {
      reset ? setLoading(false) : setLoadingMore(false);
    }
  }, [hasMore]);

  // Reload on tab change
  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    fetchPosts(activeTab, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Filter posts for each module by type
  const byType = (type) => posts.filter(p => p.type === type);

  // Determine what to render in the main content area
  const renderContent = () => {
    if (loading) return <LoadingSpinner size={36} />;
    if (error) return (
      <div className="alert alert-error" style={{ margin: '20px 0' }}>
        {error}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 12 }}
          onClick={() => fetchPosts(activeTab, true)}>Retry</button>
      </div>
    );

    const modulePosts = activeTab === 'all' ? posts : byType(activeTab);

    if (activeTab === 'all') {
      // Unified feed — just render cards from all modules in chronological order
      return (
        <UnifiedFeed
          posts={modulePosts}
          currentUserId={user?.id}
          onPostCreated={handlePostCreated}
          onPostsUpdate={setPosts}
        />
      );
    }

    if (activeTab === 'team_invite') {
      return (
        <TeamInviteModule
          posts={modulePosts}
          onPostCreated={handlePostCreated}
          onPostsUpdate={setPosts}
        />
      );
    }
    if (activeTab === 'skill_exchange') {
      return (
        <SkillExchangeModule
          posts={modulePosts}
          onPostCreated={handlePostCreated}
          onPostsUpdate={setPosts}
        />
      );
    }
    if (activeTab === 'challenge') {
      return (
        <ChallengesModule
          posts={modulePosts}
          currentUserId={user?.id}
          onPostCreated={handlePostCreated}
          onPostsUpdate={setPosts}
        />
      );
    }
    if (activeTab === 'poll') {
      return (
        <PollsModule
          posts={modulePosts}
          onPostCreated={handlePostCreated}
          onPostsUpdate={setPosts}
        />
      );
    }
    return null;
  };

  return (
    <AppShell title="Social Hub">
      {/* Tab navigation */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
        marginBottom: 28,
        background: 'rgba(255,255,255,0.06)',
        padding: '6px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius)',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
              transition: 'all var(--transition-base)',
              background: activeTab === tab.key
                ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                : 'transparent',
              color: activeTab === tab.key ? '#0b2233' : 'var(--text-tertiary)',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(157,217,253,0.25)' : 'none',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Load more */}
      {!loading && hasMore && posts.length > 0 && (
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => fetchPosts(activeTab)}
            disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </AppShell>
  );
}

/* ─── Unified Feed — renders a mix of all post types chronologically ─── */
function UnifiedFeed({ posts, currentUserId, onPostCreated, onPostsUpdate }) {
  // Delegate each card to the right module's card renderer by importing inline
  // For the unified feed we split by type and pass to the correct module renderer
  const teamPosts       = posts.filter(p => p.type === 'team_invite');
  const skillPosts      = posts.filter(p => p.type === 'skill_exchange');
  const challengePosts  = posts.filter(p => p.type === 'challenge');
  const pollPosts       = posts.filter(p => p.type === 'poll');

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🌐</div>
        <div className="empty-state-text">
          The Social Hub is quiet right now.<br />
          Switch to a tab to post something and get it started!
        </div>
      </div>
    );
  }

  // Render each module section only if it has posts — no create forms in All view
  return (
    <div>
      {teamPosts.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <TeamInviteModule
            posts={teamPosts}
            onPostCreated={onPostCreated}
            onPostsUpdate={onPostsUpdate}
          />
        </section>
      )}
      {skillPosts.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <SkillExchangeModule
            posts={skillPosts}
            onPostCreated={onPostCreated}
            onPostsUpdate={onPostsUpdate}
          />
        </section>
      )}
      {challengePosts.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <ChallengesModule
            posts={challengePosts}
            currentUserId={currentUserId}
            onPostCreated={onPostCreated}
            onPostsUpdate={onPostsUpdate}
          />
        </section>
      )}
      {pollPosts.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <PollsModule
            posts={pollPosts}
            onPostCreated={onPostCreated}
            onPostsUpdate={onPostsUpdate}
          />
        </section>
      )}
    </div>
  );
}

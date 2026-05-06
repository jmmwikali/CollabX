import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppShell, LoadingSpinner } from '../components/Layout';
import { socialAPI } from '../services/socialAPI';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TeamInviteModule from '../components/social/TeamInviteModule';
import SkillExchangeModule from '../components/social/SkillExchangeModule';
import ChallengesModule from '../components/social/ChallengesModule';
import PollsModule from '../components/social/PollsModule';

const TABS = [
  { key: 'all',            label: 'All',              icon: '🌐' },
  { key: 'team_invite',    label: 'Team Invitations',  icon: '🧑‍🤝‍🧑' },
  { key: 'skill_exchange', label: 'Skill Exchange',    icon: '🔁' },
  { key: 'challenge',      label: 'Challenges',        icon: '⚔️' },
  { key: 'poll',           label: 'Polls',             icon: '📊' },
];

/* ─── Rep point awards per action (mirrors typical backend values) ─── */
const REP_AWARDS = {
  like:             2,
  poll_vote:        5,
  challenge_submit: 15,
  team_request:     3,
  post_created:     10,
};

/* ─── Animated count-up hook ─── */
function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(target);
  const prevRef  = useRef(target);
  const rafRef   = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to   = target;
    if (from === to) return;

    const startTime = performance.now();
    const diff = to - from;

    const tick = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplay(Math.round(from + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

/* ─── Floating +XP toast that flies up and fades ─── */
function RepToast({ delta, id }) {
  const isPositive = delta > 0;
  return (
    <div
      key={id}
      style={{
        position: 'absolute',
        top: -8,
        right: -4,
        fontSize: 11,
        fontWeight: 800,
        color: isPositive ? '#4ade80' : '#f87171',
        pointerEvents: 'none',
        animation: 'repToastFly 1.4s cubic-bezier(0.16,1,0.3,1) forwards',
        letterSpacing: '0.3px',
        textShadow: isPositive
          ? '0 0 8px rgba(74,222,128,0.6)'
          : '0 0 8px rgba(248,113,113,0.6)',
        whiteSpace: 'nowrap',
        zIndex: 9999,
      }}
    >
      {isPositive ? '+' : ''}{delta} rep
    </div>
  );
}

/* ─── Reputation Points Display ─── */
function ReputationDisplay({ points, toasts }) {
  const animatedPoints = useCountUp(points ?? 0);
  const isGlowing = toasts.length > 0;

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Floating toasts */}
      {toasts.map(t => (
        <RepToast key={t.id} delta={t.delta} id={t.id} />
      ))}

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 16px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(157,217,253,0.1), rgba(0,184,204,0.08))',
        border: `1px solid ${isGlowing ? 'rgba(74,222,128,0.5)' : 'rgba(157,217,253,0.2)'}`,
        boxShadow: isGlowing
          ? '0 0 20px rgba(74,222,128,0.25), 0 0 8px rgba(74,222,128,0.1)'
          : '0 0 16px rgba(157,217,253,0.06)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}>
        <span style={{
          fontSize: 16, lineHeight: 1,
          animation: isGlowing ? 'repStarPulse 0.4s ease-in-out' : 'none',
        }}>⭐</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 18,
            color: isGlowing ? '#4ade80' : 'var(--accent)',
            letterSpacing: '-0.5px',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s ease',
          }}>
            {animatedPoints.toLocaleString()}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
            marginTop: 1,
          }}>
            Rep Points
          </span>
        </div>
      </div>

      {/* Inject keyframes once */}
      <style>{`
        @keyframes repToastFly {
          0%   { opacity: 0; transform: translateY(0px) scale(0.8); }
          15%  { opacity: 1; transform: translateY(-6px) scale(1.1); }
          70%  { opacity: 1; transform: translateY(-22px) scale(1); }
          100% { opacity: 0; transform: translateY(-36px) scale(0.9); }
        }
        @keyframes repStarPulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.5) rotate(-10deg); }
          70%  { transform: scale(0.9) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Shuffle helper (Fisher-Yates) ─── */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SocialHubPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab]     = useState('all');
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true);
  const [error, setError]             = useState('');
  const [repPoints, setRepPoints]     = useState(user?.reputation_points ?? 0);
  const [repToasts, setRepToasts]     = useState([]);  // [{ id, delta }]
  const toastCounterRef               = useRef(0);
  const offsetRef                     = useRef(0);
  const LIMIT = 20;

  /* ── Sync rep from user context ── */
  useEffect(() => {
    if (user?.reputation_points != null) {
      setRepPoints(user.reputation_points);
    }
  }, [user?.reputation_points]);

  /* ── Poll /auth/me every 30s for server-authoritative rep sync ── */
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await authAPI.getMe();
        const fresh = res.data.user?.reputation_points;
        if (fresh != null && fresh !== repPoints) {
          setRepPoints(fresh);
          updateUser(res.data.user);
        }
      } catch { /* silent */ }
    }, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repPoints]);

  /* ── Optimistic rep bump — called by action wrappers below ── */
  const awardRep = useCallback((delta) => {
    setRepPoints(prev => prev + delta);
    const id = ++toastCounterRef.current;
    setRepToasts(prev => [...prev, { id, delta }]);
    // Remove toast after animation completes (1.4s)
    setTimeout(() => {
      setRepToasts(prev => prev.filter(t => t.id !== id));
    }, 1500);
  }, []);

  /* ── Fetch posts ── */
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

  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    fetchPosts(activeTab, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    awardRep(REP_AWARDS.post_created);
  };

  /* ── Wrapped setPosts that intercepts action-based rep awards ── */
  const handlePostsUpdate = useCallback((updaterOrValue) => {
    setPosts(prev => {
      const next = typeof updaterOrValue === 'function'
        ? updaterOrValue(prev)
        : updaterOrValue;

      // Detect a like toggle: find a post whose liked_by_me flipped true
      for (let i = 0; i < Math.min(prev.length, next.length); i++) {
        const p = prev[i], n = next[i];
        if (!p || !n || p.id !== n.id) continue;

        // Like gained
        if (!p.liked_by_me && n.liked_by_me) {
          awardRep(REP_AWARDS.like);
        }
        // Like removed (unlike)
        if (p.liked_by_me && !n.liked_by_me) {
          awardRep(-REP_AWARDS.like);
        }
        // Poll vote cast (my_poll_votes went from empty to filled)
        if (
          (!p.my_poll_votes || p.my_poll_votes.length === 0) &&
          n.my_poll_votes && n.my_poll_votes.length > 0
        ) {
          awardRep(REP_AWARDS.poll_vote);
        }
        // Challenge submission
        if (!p.i_submitted && n.i_submitted) {
          awardRep(REP_AWARDS.challenge_submit);
        }
        // Team join request sent
        if (!p.my_request_status && n.my_request_status === 'pending') {
          awardRep(REP_AWARDS.team_request);
        }
      }

      return next;
    });
  }, [awardRep]);

  const shuffledPosts = useMemo(() => {
    if (activeTab === 'all') return shuffleArray(posts);
    return posts;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, activeTab]);

  const byType = (type) => posts.filter(p => p.type === type);
  const pollPosts      = posts.filter(p => p.type === 'poll');
  const challengePosts = posts.filter(p => p.type === 'challenge');

  const renderContent = () => {
    if (loading) return <LoadingSpinner size={36} />;
    if (error)   return (
      <div className="alert alert-error" style={{ margin: '20px 0' }}>
        {error}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 12 }}
          onClick={() => fetchPosts(activeTab, true)}>Retry</button>
      </div>
    );

    if (activeTab === 'all') {
      return (
        <UnifiedFeed
          posts={shuffledPosts}
          currentUserId={user?.id}
          onPostCreated={handlePostCreated}
          onPostsUpdate={handlePostsUpdate}
          onTabChange={setActiveTab}
        />
      );
    }
    if (activeTab === 'team_invite') {
      return (
        <TeamInviteModule
          posts={byType('team_invite')}
          onPostCreated={handlePostCreated}
          onPostsUpdate={handlePostsUpdate}
        />
      );
    }
    if (activeTab === 'skill_exchange') {
      return (
        <SkillExchangeModule
          posts={byType('skill_exchange')}
          onPostCreated={handlePostCreated}
          onPostsUpdate={handlePostsUpdate}
        />
      );
    }
    if (activeTab === 'challenge') {
      return (
        <ChallengesModule
          posts={byType('challenge')}
          currentUserId={user?.id}
          onPostCreated={handlePostCreated}
          onPostsUpdate={handlePostsUpdate}
        />
      );
    }
    if (activeTab === 'poll') {
      return (
        <PollsModule
          posts={byType('poll')}
          onPostCreated={handlePostCreated}
          onPostsUpdate={handlePostsUpdate}
        />
      );
    }
    return null;
  };

  /* ── Topbar height CSS var (defaults to 64px matching App.css --topbar-h) ── */
  const TOPBAR_H = 'var(--topbar-h, 64px)';

  return (
    <AppShell
      title="Social Hub"
      actions={<ReputationDisplay points={repPoints} toasts={repToasts} />}
    >
      {/*
        We override the default page-body scroll behaviour here.
        The AppShell > main.page-body already pads/contains us.
        We pull out of its natural flow with a negative margin trick
        and create our own independently scrollable columns.
      */}

      {/* Tab navigation — always visible, does not scroll */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
        marginBottom: 20,
        background: 'rgba(255,255,255,0.06)',
        padding: '6px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        flexShrink: 0,
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

      {/* ── Two-column independently scrolling layout (All tab) ── */}
      {activeTab === 'all' && !loading && !error ? (
        <div className="layout-grid" style={{
        /* Fill from here down to bottom of viewport */
          height: `calc(100vh - ${TOPBAR_H} - 36px - 36px - 52px)`,
          /* 36px top padding + 36px bottom padding from .page-body + ~52px tabs */
          minHeight: 400,
          overflow: 'hidden', // clip both columns; each scrolls internally
        }}>

          {/* LEFT — Feed column, independent scroll */}
          <div style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            paddingRight: 8,
            /* Custom thin scrollbar consistent with app theme */
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(157,217,253,0.2) transparent',
          }}>
            <UnifiedFeed
              posts={shuffledPosts}
              currentUserId={user?.id}
              onPostCreated={handlePostCreated}
              onPostsUpdate={handlePostsUpdate}
              onTabChange={setActiveTab}
            />

            {hasMore && posts.length > 0 && (
              <div style={{ textAlign: 'center', paddingTop: 16, paddingBottom: 24 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fetchPosts(activeTab)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Panels column, independent scroll */}
          <div className='instant-feed' style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(157,217,253,0.12) transparent',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
              <TrendingPollsPanel
                polls={pollPosts}
                onPollClick={() => setActiveTab('poll')}
              />
              <ActiveChallengesPanel
                challenges={challengePosts}
                onJoinChallenge={() => setActiveTab('challenge')}
              />
            </div>
          </div>

        </div>
      ) : (
        /* ── Single column for non-All tabs — normal page scroll ── */
        <>
          {renderContent()}
          {!loading && hasMore && posts.length > 0 && (
            <div style={{ textAlign: 'center', paddingTop: 16 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fetchPosts(activeTab)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Loading / error states for All tab */}
      {activeTab === 'all' && (loading || error) && renderContent()}
    </AppShell>
  );
}

/* ─── Trending Discussions Panel: live Poll Questions ─── */
function TrendingPollsPanel({ polls, onPollClick }) {
  const visiblePolls = polls.slice(0, 5);

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.03)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(196,154,74,0.05)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 15 }}>🔥</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 13, color: 'var(--text-mid)', letterSpacing: '0.3px',
        }}>
          Trending Discussions
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 10, fontWeight: 700,
          color: '#d4b070', letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          Live Polls
        </span>
      </div>

      <div style={{ padding: '8px 0' }}>
        {visiblePolls.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            No active polls yet.<br />
            <button className="btn btn-ghost btn-sm" onClick={onPollClick}
              style={{ marginTop: 8, fontSize: 11 }}>
              Create a poll →
            </button>
          </div>
        ) : (
          <>
            {visiblePolls.map((poll, idx) => (
              <TrendingPollItem key={poll.id} poll={poll} rank={idx + 1} onClick={onPollClick} />
            ))}
            {polls.length > 5 && (
              <div style={{ padding: '8px 16px' }}>
                <button className="btn btn-ghost btn-sm" onClick={onPollClick}
                  style={{ fontSize: 11, width: '100%', justifyContent: 'center' }}>
                  View all {polls.length} polls →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TrendingPollItem({ poll, rank, onClick }) {
  const [hovered, setHovered] = useState(false);
  const totalVotes = poll.poll_total_votes || 0;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        width: '100%', padding: '10px 16px',
        background: hovered ? 'rgba(157,217,253,0.05)' : 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left',
        transition: 'background var(--transition-base)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <span style={{
        fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
        minWidth: 16, fontVariantNumeric: 'tabular-nums', marginTop: 1,
      }}>
        {rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 600,
          color: hovered ? 'var(--accent)' : 'var(--text-secondary)',
          lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          transition: 'color var(--transition-base)',
        }}>
          {poll.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
          📊 {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          {poll.poll_multi && <span style={{ marginLeft: 6, opacity: 0.7 }}>· Multi-choice</span>}
        </div>
      </div>
      <span style={{
        fontSize: 12, color: 'var(--text-muted)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity var(--transition-base)',
        marginTop: 1, flexShrink: 0,
      }}>→</span>
    </button>
  );
}

/* ─── Active Challenges Panel ─── */
function ActiveChallengesPanel({ challenges, onJoinChallenge }) {
  const activeChallenges = challenges
    .filter(p => !p.deadline || new Date(p.deadline) >= new Date())
    .slice(0, 4);

  return (
    <div style={{
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(255,215,0,0.12)',
      background: 'rgba(255,215,0,0.02)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,215,0,0.1)',
        background: 'rgba(255,215,0,0.04)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 15 }}>⚔️</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 13, color: 'var(--text-mid)',
        }}>
          Active Challenges
        </span>
        {activeChallenges.length > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            background: 'rgba(255,215,0,0.1)', color: '#d4c070',
            border: '1px solid rgba(255,215,0,0.15)',
            borderRadius: 99, padding: '2px 8px',
          }}>
            {activeChallenges.length} open
          </span>
        )}
      </div>

      <div style={{ padding: '8px 0' }}>
        {activeChallenges.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            No active challenges.<br />
            <button className="btn btn-ghost btn-sm" onClick={onJoinChallenge}
              style={{ marginTop: 8, fontSize: 11 }}>
              Browse challenges →
            </button>
          </div>
        ) : (
          activeChallenges.map(challenge => (
            <ActiveChallengeItem key={challenge.id} challenge={challenge} onJoin={onJoinChallenge} />
          ))
        )}
      </div>
    </div>
  );
}

function ActiveChallengeItem({ challenge, onJoin }) {
  const [hovered, setHovered] = useState(false);

  let daysLeft = null;
  if (challenge.deadline) {
    const diff = new Date(challenge.deadline) - new Date();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 16px',
        background: hovered ? 'rgba(255,215,0,0.04)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background var(--transition-base)',
      }}
    >
      <div style={{
        fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)',
        lineHeight: 1.4, marginBottom: 6,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {challenge.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {daysLeft != null && (
          <span style={{
            fontSize: 10,
            color: daysLeft <= 2 ? 'var(--danger)' : 'var(--text-muted)',
            fontWeight: 600,
          }}>
            ⏱ {daysLeft}d left
          </span>
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={onJoin}
          style={{ fontSize: 11, padding: '3px 10px', marginLeft: 'auto' }}
        >
          Join →
        </button>
      </div>
    </div>
  );
}

/* ─── Unified Feed — randomised, interleaved, no grouping ─── */
function UnifiedFeed({ posts, currentUserId, onPostCreated, onPostsUpdate, onTabChange }) {
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

  return (
    <div>
      {posts.map(post => (
        <UnifiedPostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onPostsUpdate={onPostsUpdate}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
}

/* ─── Dispatches each card to its module renderer — no module headers ─── */
function UnifiedPostCard({ post, currentUserId, onPostsUpdate }) {
  const noop = () => {};

  if (post.type === 'team_invite') {
    return (
      <TeamInviteModule
        posts={[post]}
        onPostCreated={noop}
        onPostsUpdate={onPostsUpdate}
      />
    );
  }
  if (post.type === 'skill_exchange') {
    return (
      <SkillExchangeModule
        posts={[post]}
        onPostCreated={noop}
        onPostsUpdate={onPostsUpdate}
      />
    );
  }
  if (post.type === 'challenge') {
    return (
      <ChallengesModule
        posts={[post]}
        currentUserId={currentUserId}
        onPostCreated={noop}
        onPostsUpdate={onPostsUpdate}
      />
    );
  }
  if (post.type === 'poll') {
    return (
      <PollsModule
        posts={[post]}
        onPostCreated={noop}
        onPostsUpdate={onPostsUpdate}
      />
    );
  }
  return null;
}
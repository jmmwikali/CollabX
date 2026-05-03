/**
 * CollabX Social Hub API Service
 * All calls go through the existing axios instance (with auth interceptors).
 * Import this alongside api.js — do NOT modify api.js.
 */
import api from './api';

export const socialAPI = {
  // ── Feed ──────────────────────────────────────────────────
  /** Get feed. Pass { type, limit, offset } as params. */
  getFeed: (params) => api.get('/social/', { params }),

  /**
   * Create a new social post. */
  createPost: (data) => {
    if (data instanceof FormData) {
      return api.post('/social/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/social/', data);
  },

  /** Delete own post. */
  deletePost: (postId) => api.delete(`/social/${postId}`),

  // ── Team Invite ───────────────────────────────────────────
  /** Send a join request to a team invite post. */
  requestJoin: (postId, data) => api.post(`/social/${postId}/request`, data),

  /** Owner: get all join requests for a post. */
  getJoinRequests: (postId) => api.get(`/social/${postId}/requests`),

  /** Owner: accept or reject a join request. */
  respondJoinRequest: (postId, requestId, status) =>
    api.put(`/social/${postId}/requests/${requestId}`, { status }),

  // ── Reactions & Comments ──────────────────────────────────
  /** Toggle like on any post. */
  toggleLike: (postId) => api.post(`/social/${postId}/like`),

  /** Get comments for a post. */
  getComments: (postId) => api.get(`/social/${postId}/comments`),

  /** Add a comment to a post. */
  addComment: (postId, content) => api.post(`/social/${postId}/comments`, { content }),

  // ── Challenges ────────────────────────────────────────────
  /** Submit an entry to a challenge. */
  submitChallenge: (postId, content) => api.post(`/social/${postId}/submit`, { content }),

  /** Get all submissions for a challenge. */
  getSubmissions: (postId) => api.get(`/social/${postId}/submissions`),

  /** Vote on a submission. */
  voteSubmission: (postId, submissionId) =>
    api.post(`/social/${postId}/submissions/${submissionId}/vote`),

  // ── Polls ─────────────────────────────────────────────────
  /** Vote on a poll. option_indices is an array of ints. */
  votePoll: (postId, option_indices) =>
    api.post(`/social/${postId}/vote`, { option_indices }),

  // ── Reputation ────────────────────────────────────────────
  /**
   * Check and award the winner of an expired challenge.
   * Idempotent — safe to call multiple times; only awards once.
   * Call this when you detect post.deadline < Date.now().
   */
  checkChallengeWinner: (postId) =>
    api.post(`/reputation/challenge/${postId}/check-winner`),
};
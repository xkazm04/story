/**
 * Preference Engine - Storage Module
 *
 * IndexedDB operations: DB setup, profile CRUD, feedback CRUD,
 * pattern CRUD, session storage, dimension pattern storage,
 * style preference storage, suggestion storage, import/export.
 */

import {
  PreferenceProfile,
  PromptFeedback,
  PromptPattern,
  GenerationSession,
  DimensionCombinationPattern,
  StylePreference,
  SmartSuggestion,
} from '../../types';

// IndexedDB configuration for preference storage
const DB_NAME = 'simulator_preferences_db';
const DB_VERSION = 2; // Upgraded for new stores
export const PROFILE_STORE = 'preference_profiles';
export const FEEDBACK_STORE = 'prompt_feedback';
export const PATTERN_STORE = 'prompt_patterns';
export const SESSION_STORE = 'generation_sessions';
export const DIMENSION_PATTERN_STORE = 'dimension_patterns';
export const STYLE_PREFERENCE_STORE = 'style_preferences';
export const SUGGESTION_STORE = 'smart_suggestions';

let dbInstance: IDBDatabase | null = null;

export const DEFAULT_PROFILE_ID = 'default-user-profile';

/**
 * Check if running on client side (not SSR)
 */
export function isClientSide(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

/**
 * Create a default profile for SSR fallback
 */
export function createDefaultProfile(): PreferenceProfile {
  return {
    id: DEFAULT_PROFILE_ID,
    preferences: [],
    patterns: [],
    totalFeedbackCount: 0,
    positiveCount: 0,
    negativeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// IndexedDB Setup
// ============================================================================

export function openPreferenceDB(): Promise<IDBDatabase> {
  // Guard against SSR - IndexedDB not available on server
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available on server'));
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open preference database'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create store for preference profiles
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        const profileStore = db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
        profileStore.createIndex('userId', 'userId', { unique: false });
      }

      // Create store for individual feedback items
      if (!db.objectStoreNames.contains(FEEDBACK_STORE)) {
        const feedbackStore = db.createObjectStore(FEEDBACK_STORE, { keyPath: 'id' });
        feedbackStore.createIndex('promptId', 'promptId', { unique: false });
        feedbackStore.createIndex('sessionId', 'sessionId', { unique: false });
        feedbackStore.createIndex('rating', 'rating', { unique: false });
        feedbackStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create store for learned patterns
      if (!db.objectStoreNames.contains(PATTERN_STORE)) {
        const patternStore = db.createObjectStore(PATTERN_STORE, { keyPath: 'id' });
        patternStore.createIndex('type', 'type', { unique: false });
        patternStore.createIndex('confidence', 'confidence', { unique: false });
      }

      // Create store for generation sessions (Phase 1: Time metrics)
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
        sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
        sessionStore.createIndex('successful', 'successful', { unique: false });
      }

      // Create store for dimension combination patterns (Phase 2)
      if (!db.objectStoreNames.contains(DIMENSION_PATTERN_STORE)) {
        const dimPatternStore = db.createObjectStore(DIMENSION_PATTERN_STORE, { keyPath: 'id' });
        dimPatternStore.createIndex('successRate', 'successRate', { unique: false });
        dimPatternStore.createIndex('usageCount', 'usageCount', { unique: false });
      }

      // Create store for style preferences (Phase 2)
      if (!db.objectStoreNames.contains(STYLE_PREFERENCE_STORE)) {
        const styleStore = db.createObjectStore(STYLE_PREFERENCE_STORE, { keyPath: 'id' });
        styleStore.createIndex('category', 'category', { unique: false });
        styleStore.createIndex('strength', 'strength', { unique: false });
      }

      // Create store for smart suggestions (Phase 3)
      if (!db.objectStoreNames.contains(SUGGESTION_STORE)) {
        const suggestionStore = db.createObjectStore(SUGGESTION_STORE, { keyPath: 'id' });
        suggestionStore.createIndex('type', 'type', { unique: false });
        suggestionStore.createIndex('accepted', 'accepted', { unique: false });
        suggestionStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

// ============================================================================
// Preference Profile Management
// ============================================================================

/**
 * Get or create the default preference profile
 */
export async function getPreferenceProfile(): Promise<PreferenceProfile> {
  // Return empty profile on server-side
  if (!isClientSide()) {
    return createDefaultProfile();
  }

  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROFILE_STORE], 'readonly');
    const store = transaction.objectStore(PROFILE_STORE);
    const request = store.get(DEFAULT_PROFILE_ID);

    request.onerror = () => reject(new Error('Failed to get profile'));
    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        resolve(createDefaultProfile());
      }
    };
  });
}

/**
 * Save the preference profile
 */
export async function savePreferenceProfile(profile: PreferenceProfile): Promise<void> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROFILE_STORE], 'readwrite');
    const store = transaction.objectStore(PROFILE_STORE);
    const request = store.put({ ...profile, updatedAt: new Date().toISOString() });

    request.onerror = () => reject(new Error('Failed to save profile'));
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// Feedback Storage
// ============================================================================

/**
 * Store feedback for a prompt
 */
export async function storeFeedback(feedback: PromptFeedback): Promise<void> {
  if (!isClientSide()) return;
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FEEDBACK_STORE], 'readwrite');
    const store = transaction.objectStore(FEEDBACK_STORE);
    const request = store.put(feedback);

    request.onerror = () => reject(new Error('Failed to store feedback'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all feedback for a specific prompt
 */
export async function getFeedbackForPrompt(promptId: string): Promise<PromptFeedback[]> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FEEDBACK_STORE], 'readonly');
    const store = transaction.objectStore(FEEDBACK_STORE);
    const index = store.index('promptId');
    const request = index.getAll(promptId);

    request.onerror = () => reject(new Error('Failed to get feedback'));
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Get all feedback (limited to most recent N items)
 */
export async function getAllFeedback(limit: number = 100): Promise<PromptFeedback[]> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FEEDBACK_STORE], 'readonly');
    const store = transaction.objectStore(FEEDBACK_STORE);
    const index = store.index('createdAt');
    const request = index.openCursor(null, 'prev'); // Newest first

    const results: PromptFeedback[] = [];

    request.onerror = () => reject(new Error('Failed to get feedback'));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor && results.length < limit) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
}

/**
 * Get feedback by rating type
 */
export async function getFeedbackByRating(rating: 'up' | 'down'): Promise<PromptFeedback[]> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FEEDBACK_STORE], 'readonly');
    const store = transaction.objectStore(FEEDBACK_STORE);
    const index = store.index('rating');
    const request = index.getAll(rating);

    request.onerror = () => reject(new Error('Failed to get feedback by rating'));
    request.onsuccess = () => resolve(request.result || []);
  });
}

// ============================================================================
// Pattern Storage
// ============================================================================

/**
 * Store or update a learned pattern
 */
export async function storePattern(pattern: PromptPattern): Promise<void> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PATTERN_STORE], 'readwrite');
    const store = transaction.objectStore(PATTERN_STORE);
    const request = store.put(pattern);

    request.onerror = () => reject(new Error('Failed to store pattern'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all patterns above a confidence threshold
 */
export async function getPatternsAboveConfidence(threshold: number = 0.5): Promise<PromptPattern[]> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PATTERN_STORE], 'readonly');
    const store = transaction.objectStore(PATTERN_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get patterns'));
    request.onsuccess = () => {
      const patterns = (request.result || []).filter(
        (p: PromptPattern) => p.confidence >= threshold
      );
      resolve(patterns);
    };
  });
}

/**
 * Get patterns by type
 */
export async function getPatternsByType(
  type: PromptPattern['type']
): Promise<PromptPattern[]> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PATTERN_STORE], 'readonly');
    const store = transaction.objectStore(PATTERN_STORE);
    const index = store.index('type');
    const request = index.getAll(type);

    request.onerror = () => reject(new Error('Failed to get patterns by type'));
    request.onsuccess = () => resolve(request.result || []);
  });
}

// ============================================================================
// Session Storage
// ============================================================================

/**
 * Store a generation session in IndexedDB
 */
export async function storeSession(session: GenerationSession): Promise<void> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.put(session);

    request.onerror = () => reject(new Error('Failed to store session'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Get recent successful sessions for learning
 * Note: We filter in JS because IndexedDB doesn't support boolean keys
 */
export async function getSuccessfulSessions(limit: number = 50): Promise<GenerationSession[]> {
  if (!isClientSide()) return [];
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get sessions'));
    request.onsuccess = () => {
      const sessions = (request.result || [])
        .filter((s: GenerationSession) => s.successful === true)
        .sort((a: GenerationSession, b: GenerationSession) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, limit);
      resolve(sessions);
    };
  });
}

// ============================================================================
// Dimension Pattern Storage
// ============================================================================

/**
 * Store a dimension combination pattern
 */
export async function storeDimensionPattern(pattern: DimensionCombinationPattern): Promise<void> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DIMENSION_PATTERN_STORE], 'readwrite');
    const store = transaction.objectStore(DIMENSION_PATTERN_STORE);
    const request = store.put(pattern);

    request.onerror = () => reject(new Error('Failed to store dimension pattern'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Get dimension patterns above a usage threshold
 */
export async function getDimensionPatterns(minUsage: number = 2): Promise<DimensionCombinationPattern[]> {
  if (!isClientSide()) return [];
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DIMENSION_PATTERN_STORE], 'readonly');
    const store = transaction.objectStore(DIMENSION_PATTERN_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get dimension patterns'));
    request.onsuccess = () => {
      const patterns = (request.result || []).filter(
        (p: DimensionCombinationPattern) => p.usageCount >= minUsage
      );
      resolve(patterns);
    };
  });
}

// ============================================================================
// Style Preference Storage
// ============================================================================

/**
 * Get a specific style preference
 */
export async function getStylePreference(
  category: StylePreference['category'],
  value: string
): Promise<StylePreference | null> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STYLE_PREFERENCE_STORE], 'readonly');
    const store = transaction.objectStore(STYLE_PREFERENCE_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get style preference'));
    request.onsuccess = () => {
      const prefs = request.result || [];
      const match = prefs.find(
        (p: StylePreference) =>
          p.category === category && p.value.toLowerCase() === value.toLowerCase()
      );
      resolve(match || null);
    };
  });
}

/**
 * Store a style preference
 */
export async function storeStylePreference(pref: StylePreference): Promise<void> {
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STYLE_PREFERENCE_STORE], 'readwrite');
    const store = transaction.objectStore(STYLE_PREFERENCE_STORE);
    const request = store.put(pref);

    request.onerror = () => reject(new Error('Failed to store style preference'));
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all style preferences above a strength threshold
 */
export async function getStylePreferences(minStrength: number = 50): Promise<StylePreference[]> {
  if (!isClientSide()) return [];
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STYLE_PREFERENCE_STORE], 'readonly');
    const store = transaction.objectStore(STYLE_PREFERENCE_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get style preferences'));
    request.onsuccess = () => {
      const prefs = (request.result || []).filter(
        (p: StylePreference) => p.strength >= minStrength
      );
      resolve(prefs);
    };
  });
}

// ============================================================================
// Suggestion Storage
// ============================================================================

/**
 * Record suggestion acceptance/rejection
 */
export async function recordSuggestionResponse(
  suggestionId: string,
  accepted: boolean
): Promise<void> {
  if (!isClientSide()) return;
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUGGESTION_STORE], 'readwrite');
    const store = transaction.objectStore(SUGGESTION_STORE);
    const getRequest = store.get(suggestionId);

    getRequest.onerror = () => reject(new Error('Failed to get suggestion'));
    getRequest.onsuccess = () => {
      const suggestion = getRequest.result;
      if (suggestion) {
        suggestion.accepted = accepted;
        suggestion.shown = true;
        const putRequest = store.put(suggestion);
        putRequest.onerror = () => reject(new Error('Failed to update suggestion'));
        putRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
  });
}

/**
 * Store a suggestion
 */
export async function storeSuggestion(suggestion: SmartSuggestion): Promise<void> {
  if (!isClientSide()) return;
  const db = await openPreferenceDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SUGGESTION_STORE], 'readwrite');
    const store = transaction.objectStore(SUGGESTION_STORE);
    const request = store.put(suggestion);

    request.onerror = () => reject(new Error('Failed to store suggestion'));
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// Import / Export
// ============================================================================

/**
 * Export preferences as JSON (for backup/sharing)
 */
export async function exportPreferences(): Promise<string> {
  const profile = await getPreferenceProfile();
  const feedback = await getAllFeedback(1000);
  const patterns = await getPatternsAboveConfidence(0);

  return JSON.stringify({
    profile,
    feedback,
    patterns,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import preferences from JSON
 */
export async function importPreferences(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);

  if (data.profile) {
    await savePreferenceProfile(data.profile);
  }

  if (data.feedback) {
    for (const fb of data.feedback) {
      await storeFeedback(fb);
    }
  }

  if (data.patterns) {
    for (const pattern of data.patterns) {
      await storePattern(pattern);
    }
  }
}

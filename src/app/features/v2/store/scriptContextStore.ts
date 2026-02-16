/**
 * Script Context Store — Cross-panel communication for the Studio layout.
 *
 * The scene editor publishes which characters (speakers) and beats are
 * referenced in the active script. Sidebar panels subscribe to highlight
 * referenced items. Sidebars can also request block insertions into the editor.
 *
 * Ephemeral UI state — no persistence needed.
 */

import { create } from 'zustand';

interface InsertRequest {
  type: string;
  speaker?: string;
  beatRef?: string;
}

interface ScriptContextState {
  /** Character names appearing in @dialogue[NAME] blocks */
  referencedSpeakers: string[];
  /** Beat names appearing in @beat[NAME] blocks */
  referencedBeats: string[];
  /** Update references (called by editor on every block change) */
  setReferences: (speakers: string[], beats: string[]) => void;

  /** Pending block insertion requested by a sidebar panel */
  pendingInsert: InsertRequest | null;
  /** Request a block insertion (called by sidebar panels) */
  requestInsert: (block: InsertRequest) => void;
  /** Consume the pending insertion (called by editor) */
  consumeInsert: () => InsertRequest | null;
}

export const useScriptContextStore = create<ScriptContextState>((set, get) => ({
  referencedSpeakers: [],
  referencedBeats: [],

  setReferences: (speakers, beats) => {
    set({ referencedSpeakers: speakers, referencedBeats: beats });
  },

  pendingInsert: null,

  requestInsert: (block) => {
    set({ pendingInsert: block });
  },

  consumeInsert: () => {
    const pending = get().pendingInsert;
    if (pending) {
      set({ pendingInsert: null });
    }
    return pending;
  },
}));

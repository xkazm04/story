'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Shield, TrendingUp } from 'lucide-react';
import { Character, FACTION_ROLES, FactionRole } from '@/app/types/Character';
import { characterApi } from '@/app/api/characters';

interface RoleRankEditorProps {
  character: Character;
  onClose: () => void;
  onUpdate: () => void;
}

const RoleRankEditor: React.FC<RoleRankEditorProps> = ({
  character,
  onClose,
  onUpdate,
}) => {
  const [factionRole, setFactionRole] = useState<string>(character.faction_role || '');
  const [customRole, setCustomRole] = useState('');
  const [factionRank, setFactionRank] = useState<number>(character.faction_rank || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const roleToSave = factionRole === 'Custom' ? customRole : factionRole;

      await characterApi.updateCharacter(character.id, {
        faction_role: roleToSave || undefined,
        faction_rank: factionRank,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update character role/rank:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 rounded-xl border border-purple-500/30 shadow-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="text-purple-400" size={24} />
            Edit Role & Rank
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            data-testid="close-role-editor-btn"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              {character.avatar_url && (
                <img
                  src={character.avatar_url}
                  alt={character.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-semibold text-white">{character.name}</div>
                <div className="text-sm text-gray-400">
                  Current: {character.faction_role || 'No role'} (Rank: {character.faction_rank || 0})
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Shield size={16} className="text-purple-400" />
              Faction Role
            </label>
            <select
              value={factionRole}
              onChange={(e) => setFactionRole(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              data-testid="faction-role-select"
            >
              <option value="">-- No Role --</option>
              {FACTION_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
              <option value="Custom">Custom Role...</option>
            </select>
          </div>

          {/* Custom Role Input */}
          {factionRole === 'Custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Role Name
              </label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter custom role..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                data-testid="custom-role-input"
              />
            </motion.div>
          )}

          {/* Rank Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" />
              Faction Rank
            </label>
            <div className="space-y-2">
              <input
                type="number"
                value={factionRank}
                onChange={(e) => setFactionRank(Number(e.target.value))}
                min="0"
                max="100"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                data-testid="faction-rank-input"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0 = Lowest</span>
                <span>Higher = More Important</span>
                <span>100 = Highest</span>
              </div>
              {/* Visual Rank Indicator */}
              <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(factionRank, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || (factionRole === 'Custom' && !customRole.trim())}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
              data-testid="save-role-rank-btn"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              data-testid="cancel-role-edit-btn"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>Tip:</strong> Use roles to define positions (Leader, Guard, etc.) and ranks to establish hierarchy within those roles. Higher ranks appear first in sorted lists.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RoleRankEditor;

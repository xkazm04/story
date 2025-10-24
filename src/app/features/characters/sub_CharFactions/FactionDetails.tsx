'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Users, Save, X } from 'lucide-react';
import { Faction } from '@/app/types/Faction';
import { factionApi } from '@/app/api/factions';
import { characterApi } from '@/app/api/characters';
import { useProjectStore } from '@/app/store/projectStore';
import ColoredBorder from '@/app/components/UI/ColoredBorder';
import CharacterCard from '../components/CharacterCard';

interface FactionDetailsProps {
  faction: Faction;
  onBack: () => void;
  onUpdate: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#71717a',
];

const FactionDetails: React.FC<FactionDetailsProps> = ({
  faction,
  onBack,
  onUpdate,
}) => {
  const { selectedProject } = useProjectStore();
  const { data: characters = [] } = characterApi.useProjectCharacters(
    selectedProject?.id || '',
    !!selectedProject
  );

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(faction.name);
  const [description, setDescription] = useState(faction.description || '');
  const [color, setColor] = useState(faction.color || PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get characters in this faction
  const factionMembers = characters.filter((char) => char.faction_id === faction.id);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await factionApi.updateFaction(faction.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update faction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete faction "${faction.name}"? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      await factionApi.deleteFaction(faction.id);
      onUpdate();
      onBack();
    } catch (error) {
      console.error('Failed to delete faction:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setName(faction.name);
    setDescription(faction.description || '');
    setColor(faction.color || PRESET_COLORS[0]);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Factions
        </button>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Save size={16} />
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Faction Info */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
        <ColoredBorder color="blue" />
        
        {faction.color && !isEditing && (
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
            style={{ backgroundColor: faction.color }}
          />
        )}

        <div className="flex gap-6">
          {/* Logo/Icon */}
          <div
            className="w-24 h-24 rounded-lg flex items-center justify-center text-3xl font-bold flex-shrink-0"
            style={{
              backgroundColor: (isEditing ? color : faction.color)
                ? `${isEditing ? color : faction.color}20`
                : '#1f2937',
              color: (isEditing ? color : faction.color) || '#9ca3af',
            }}
          >
            {(isEditing ? name : faction.name).charAt(0).toUpperCase()}
          </div>

          {/* Faction Details */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[100px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((presetColor) => (
                      <button
                        key={presetColor}
                        type="button"
                        onClick={() => setColor(presetColor)}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          color === presetColor
                            ? 'ring-2 ring-white scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: presetColor }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">{faction.name}</h2>
                {faction.description && (
                  <p className="text-gray-400">{faction.description}</p>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={16} />
                  <span>{factionMembers.length} members</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
        <ColoredBorder color="purple" />
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={18} />
          Faction Members ({factionMembers.length})
        </h3>

        {factionMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {factionMembers.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No characters in this faction yet
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default FactionDetails;


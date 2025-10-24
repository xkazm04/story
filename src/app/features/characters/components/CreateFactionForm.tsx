'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { factionApi } from '@/app/api/factions';
import { useProjectStore } from '@/app/store/projectStore';
import ColoredBorder from '@/app/components/UI/ColoredBorder';

interface CreateFactionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#71717a',
];

const CreateFactionForm: React.FC<CreateFactionFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const { selectedProject } = useProjectStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedProject) return;

    setIsSubmitting(true);
    setError('');

    try {
      const newFaction = await factionApi.createFaction({
        name: name.trim(),
        description: description.trim() || undefined,
        project_id: selectedProject.id,
      });

      // Update with color if provided
      if (color && newFaction.id) {
        await factionApi.updateFaction(newFaction.id, { color });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create faction');
      console.error('Error creating faction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-lg w-full"
      >
        <ColoredBorder color="blue" />
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Create New Faction</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Faction Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Faction Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter faction name"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the faction's purpose, values, or history..."
              className="w-full min-h-[100px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Faction Color
            </label>
            <div className="grid grid-cols-10 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === presetColor
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {name.charAt(0).toUpperCase() || 'F'}
              </div>
              <div>
                <div className="font-semibold text-white">
                  {name || 'Faction Name'}
                </div>
                {description && (
                  <div className="text-sm text-gray-400 line-clamp-1">
                    {description}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              {isSubmitting ? 'Creating...' : 'Create Faction'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateFactionForm;


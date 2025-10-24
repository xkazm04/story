'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { characterApi } from '@/app/api/characters';
import { factionApi } from '@/app/api/factions';
import { useProjectStore } from '@/app/store/projectStore';
import { CHARACTER_TYPES } from '@/app/store/characterStore';

interface CharacterCreateFormProps {
  onClose: () => void;
}

const CharacterCreateForm: React.FC<CharacterCreateFormProps> = ({ onClose }) => {
  const { selectedProject } = useProjectStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [factionId, setFactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: factions = [] } = factionApi.useFactions(
    selectedProject?.id || '',
    !!selectedProject
  );
  const { refetch } = characterApi.useProjectCharacters(selectedProject?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedProject) return;

    setIsSubmitting(true);
    try {
      await characterApi.createCharacter({
        name: name.trim(),
        project_id: selectedProject.id,
        type: type || undefined,
        faction_id: factionId || undefined,
      });
      refetch();
      onClose();
    } catch (error) {
      console.error('Failed to create character:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Create New Character</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Character Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select type (optional)</option>
          {CHARACTER_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Faction</label>
        <select
          value={factionId}
          onChange={(e) => setFactionId(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Independent (no faction)</option>
          {factions.map((faction) => (
            <option key={faction.id} value={faction.id}>
              {faction.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Character'}
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
  );
};

export default CharacterCreateForm;

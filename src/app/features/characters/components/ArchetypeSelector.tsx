'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  ChevronDown,
  User,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
  Zap
} from 'lucide-react';
import { CharacterArchetype, ArchetypeCategory, ArchetypeGenre } from '@/app/types/Archetype';
import {
  ARCHETYPE_LIBRARY,
  getAllCategories,
  getArchetypesByCategory,
  getArchetypesByGenre,
  searchArchetypes
} from '@/app/lib/archetypes/archetypeLibrary';

interface ArchetypeSelectorProps {
  onSelect: (archetype: CharacterArchetype) => void;
  onClose: () => void;
  currentGenre?: string;
}

const ArchetypeSelector: React.FC<ArchetypeSelectorProps> = ({
  onSelect,
  onClose,
  currentGenre,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<CharacterArchetype | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = useMemo(() => ['all', ...getAllCategories()], []);

  const filteredArchetypes = useMemo(() => {
    let archetypes = [...ARCHETYPE_LIBRARY];

    // Filter by category
    if (selectedCategory !== 'all') {
      archetypes = getArchetypesByCategory(selectedCategory);
    }

    // Filter by genre if provided
    if (currentGenre) {
      archetypes = archetypes.filter(
        a => a.genre.includes(currentGenre as ArchetypeGenre) || a.genre.includes('all')
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchResults = searchArchetypes(searchTerm);
      archetypes = archetypes.filter(a => searchResults.find(s => s.id === a.id));
    }

    // Sort by popularity
    return archetypes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [selectedCategory, currentGenre, searchTerm]);

  const handleArchetypeClick = (archetype: CharacterArchetype) => {
    setSelectedArchetype(archetype);
    setShowPreview(true);
  };

  const handleApplyArchetype = () => {
    if (selectedArchetype) {
      onSelect(selectedArchetype);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Sparkles className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Archetype Library</h2>
                <p className="text-sm text-gray-400">
                  Choose a pre-built character template to instantly populate your character
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              data-testid="archetype-selector-close-btn"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archetypes..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                data-testid="archetype-search-input"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                data-testid="archetype-category-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Archetype Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArchetypes.map((archetype) => (
                <motion.div
                  key={archetype.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleArchetypeClick(archetype)}
                  className={`p-4 bg-gray-800/50 border rounded-lg cursor-pointer transition-all ${
                    selectedArchetype?.id === archetype.id
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  data-testid={`archetype-card-${archetype.id}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{archetype.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full">
                        {archetype.category}
                      </span>
                    </div>
                    {selectedArchetype?.id === archetype.id && (
                      <CheckCircle2 className="text-purple-400 flex-shrink-0" size={20} />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {archetype.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {archetype.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredArchetypes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <User size={48} className="mb-4 opacity-50" />
                <p className="text-lg">No archetypes found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && selectedArchetype && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-96 border-l border-gray-700 bg-gray-800/50 overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {selectedArchetype.name}
                      </h3>
                      <span className="text-sm px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full">
                        {selectedArchetype.category}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-300 mb-6">{selectedArchetype.description}</p>

                  {/* What's Included */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                      What's Included
                    </h4>

                    <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <ImageIcon size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-white">Full Appearance</div>
                        <div className="text-xs text-gray-400">
                          Physical traits, facial features, clothing, and unique characteristics
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <FileText size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-white">Backstory & Personality</div>
                        <div className="text-xs text-gray-400">
                          Character history, motivations, and personality traits
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                      <Zap size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-white">AI Prompts</div>
                        <div className="text-xs text-gray-400">
                          Ready-to-use image generation and story prompts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Backstory</h4>
                      <p className="text-sm text-gray-300">{selectedArchetype.backstory}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Personality</h4>
                      <p className="text-sm text-gray-300">{selectedArchetype.personality}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Motivations</h4>
                      <p className="text-sm text-gray-300">{selectedArchetype.motivations}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Appearance Highlights</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>• {selectedArchetype.appearance.gender}, {selectedArchetype.appearance.age}</div>
                        <div>• {selectedArchetype.appearance.face.hairColor} hair, {selectedArchetype.appearance.face.eyeColor} eyes</div>
                        <div>• {selectedArchetype.appearance.bodyType}</div>
                        <div>• {selectedArchetype.appearance.clothing.style}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedArchetype.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between bg-gray-900/50">
          <div className="text-sm text-gray-400">
            {filteredArchetypes.length} archetype{filteredArchetypes.length !== 1 ? 's' : ''} available
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
              data-testid="archetype-cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyArchetype}
              disabled={!selectedArchetype}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              data-testid="archetype-apply-btn"
            >
              <Sparkles size={18} />
              Apply Archetype
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ArchetypeSelector;

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Filter, Edit, Plus, Scroll } from 'lucide-react';
import { FactionLore } from '@/app/types/Faction';

interface LoreRepositoryProps {
  loreEntries: FactionLore[];
  isLeader: boolean;
  onAddLore?: () => void;
  onEditLore?: (loreId: string) => void;
}

const categoryLabels = {
  history: 'History',
  culture: 'Culture',
  conflicts: 'Conflicts',
  'notable-figures': 'Notable Figures',
};

const categoryColors = {
  history: 'from-blue-500 to-cyan-600',
  culture: 'from-purple-500 to-pink-600',
  conflicts: 'from-red-500 to-orange-600',
  'notable-figures': 'from-yellow-500 to-amber-600',
};

const LoreRepository: React.FC<LoreRepositoryProps> = ({
  loreEntries,
  isLeader,
  onAddLore,
  onEditLore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedLore, setExpandedLore] = useState<string | null>(null);

  // Filter and search lore entries
  const filteredLore = useMemo(() => {
    return loreEntries.filter((lore) => {
      const matchesSearch =
        searchTerm === '' ||
        lore.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lore.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === null || lore.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [loreEntries, searchTerm, selectedCategory]);

  // Count entries per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      history: 0,
      culture: 0,
      conflicts: 0,
      'notable-figures': 0,
    };
    loreEntries.forEach((lore) => {
      counts[lore.category]++;
    });
    return counts;
  }, [loreEntries]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold text-white">Lore Repository</h3>
              <p className="text-sm text-gray-400">
                {filteredLore.length} of {loreEntries.length} entries
              </p>
            </div>
          </div>
          {isLeader && onAddLore && (
            <button
              onClick={onAddLore}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add Lore
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lore entries..."
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-500" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({loreEntries.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {label} ({categoryCounts[key] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Lore entries */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredLore.map((lore, index) => {
            const isExpanded = expandedLore === lore.id;
            const gradient = categoryColors[lore.category];

            return (
              <motion.div
                key={lore.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
                  {/* Colored top border */}
                  <div className={`h-1 bg-gradient-to-r ${gradient}`} />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Scroll size={18} className="text-purple-400" />
                          <span
                            className={`px-2 py-0.5 bg-gradient-to-r ${gradient} bg-opacity-20 rounded text-xs font-medium text-white`}
                          >
                            {categoryLabels[lore.category]}
                          </span>
                        </div>
                        <h4 className="text-xl font-semibold text-white mb-1">
                          {lore.title}
                        </h4>
                        <div className="text-xs text-gray-500">
                          Created {formatDate(lore.created_at)}
                          {lore.updated_at && ` • Updated ${formatDate(lore.updated_at)}`}
                        </div>
                      </div>
                      {isLeader && onEditLore && (
                        <button
                          onClick={() => onEditLore(lore.id)}
                          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </div>

                    {/* Content with typewriter effect */}
                    <motion.div
                      className="relative"
                      initial={false}
                      animate={{
                        height: isExpanded ? 'auto' : '6rem',
                      }}
                    >
                      <div className="prose prose-invert prose-sm max-w-none overflow-hidden">
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: isExpanded ? 1 : 0.9,
                          }}
                          className={`text-gray-300 leading-relaxed whitespace-pre-wrap ${
                            !isExpanded ? 'line-clamp-3' : ''
                          }`}
                        >
                          {lore.content}
                        </motion.div>
                      </div>

                      {/* Gradient fade for collapsed state */}
                      {!isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent" />
                      )}
                    </motion.div>

                    {/* Expand/collapse button */}
                    <button
                      onClick={() =>
                        setExpandedLore(isExpanded ? null : lore.id)
                      }
                      className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      {isExpanded ? 'Show less' : 'Read more...'}
                    </button>
                  </div>

                  {/* Scroll effect decoration */}
                  {isExpanded && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className={`h-0.5 bg-gradient-to-r ${gradient}`}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredLore.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen size={48} className="mx-auto mb-4 text-gray-600 opacity-50" />
          <p className="text-gray-500">
            {searchTerm || selectedCategory
              ? 'No lore entries match your search'
              : 'No lore entries yet'}
          </p>
          {isLeader && !searchTerm && !selectedCategory && (
            <button
              onClick={onAddLore}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add First Lore Entry
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LoreRepository;

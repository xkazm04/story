'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye } from 'lucide-react';
import { Faction } from '@/app/types/Faction';
import { characterApi } from '@/app/api/characters';
import { useProjectStore } from '@/app/store/projectStore';

interface FactionCardProps {
  faction: Faction;
  onSelect: (faction: Faction) => void;
}

const FactionCard: React.FC<FactionCardProps> = ({ faction, onSelect }) => {
  const { selectedProject } = useProjectStore();
  const { data: characters = [] } = characterApi.useProjectCharacters(
    selectedProject?.id || '',
    !!selectedProject
  );

  // Count characters in this faction
  const memberCount = characters.filter((char) => char.faction_id === faction.id).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(faction)}
      className="relative group cursor-pointer bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-all"
    >
      {/* Faction Color Accent */}
      {faction.color && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: faction.color }}
        />
      )}

      <div className="p-6">
        {/* Logo/Icon */}
        {faction.logo_url ? (
          <div className="w-16 h-16 rounded-lg bg-gray-800 mb-4 overflow-hidden">
            <img
              src={faction.logo_url}
              alt={faction.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-16 h-16 rounded-lg mb-4 flex items-center justify-center text-2xl font-bold"
            style={{
              backgroundColor: faction.color ? `${faction.color}20` : '#1f2937',
              color: faction.color || '#9ca3af',
            }}
          >
            {faction.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Faction Name */}
        <h3 className="text-lg font-semibold text-white mb-2">{faction.name}</h3>

        {/* Description */}
        {faction.description && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {faction.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={16} />
            <span>{memberCount} members</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(faction);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FactionCard;


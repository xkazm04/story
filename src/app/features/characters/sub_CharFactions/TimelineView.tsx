'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Swords, Handshake, Compass, Award, Flame, Trophy } from 'lucide-react';
import { FactionEvent } from '@/app/types/Faction';

interface TimelineViewProps {
  events: FactionEvent[];
}

const eventIcons = {
  founding: Trophy,
  battle: Swords,
  alliance: Handshake,
  discovery: Compass,
  ceremony: Award,
  conflict: Flame,
  achievement: Award,
};

const eventColors = {
  founding: 'from-yellow-500 to-amber-600',
  battle: 'from-red-500 to-rose-600',
  alliance: 'from-green-500 to-emerald-600',
  discovery: 'from-blue-500 to-cyan-600',
  ceremony: 'from-purple-500 to-violet-600',
  conflict: 'from-orange-500 to-red-600',
  achievement: 'from-indigo-500 to-purple-600',
};

const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    return { year, month, day };
  };

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50" />

      {/* Timeline events */}
      <div className="space-y-8">
        {events.map((event, index) => {
          const Icon = eventIcons[event.event_type];
          const colorGradient = eventColors[event.event_type];
          const date = formatDate(event.date);
          const isExpanded = expandedEvent === event.id;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative pl-20"
            >
              {/* Timeline node */}
              <motion.div
                className={`absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon className="text-white" size={28} />
              </motion.div>

              {/* Event card */}
              <motion.div
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
              >
                {/* Colored top border */}
                <div className={`h-1 bg-gradient-to-r ${colorGradient}`} />

                <div className="p-6">
                  {/* Date and title */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Calendar size={14} />
                        <span>
                          {date.month} {date.day}, {date.year}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-800 rounded text-xs capitalize">
                          {event.event_type}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: isExpanded ? 'auto' : '3rem',
                      opacity: isExpanded ? 1 : 0.8,
                    }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-300 leading-relaxed">{event.description}</p>
                  </motion.div>

                  {/* Expand indicator */}
                  {!isExpanded && event.description.length > 150 && (
                    <div className="mt-2 text-blue-400 text-sm font-medium">
                      Click to read more...
                    </div>
                  )}
                </div>

                {/* Animated particles on hover */}
                <motion.div
                  className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${colorGradient}`}
                      initial={{ x: 0, y: 0, opacity: 0 }}
                      whileHover={{
                        x: Math.random() * 100 - 50,
                        y: Math.random() * 100 - 50,
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No events in the timeline yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;

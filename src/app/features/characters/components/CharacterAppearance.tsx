'use client';

import React from 'react';
import { CharacterAppearanceForm } from '../sub_CharacterCreator';

interface CharacterAppearanceProps {
  characterId: string;
}

/**
 * Character Appearance Component
 * Now uses the modular CharacterAppearanceForm with AI-powered image extraction
 */
const CharacterAppearance: React.FC<CharacterAppearanceProps> = ({
  characterId,
}) => {
  return <CharacterAppearanceForm characterId={characterId} />;
};

export default CharacterAppearance;


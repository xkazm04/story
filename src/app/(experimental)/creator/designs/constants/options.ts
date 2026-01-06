/**
 * Options for each category - these populate the right sidebar palette
 */

import type { CategoryOption, CategoryId } from '../types';

export const CATEGORY_OPTIONS: Record<CategoryId, CategoryOption[]> = {
  hair: [
    { id: 1, name: 'Long Wavy', preview: '💇‍♀️', promptValue: 'long wavy flowing' },
    { id: 2, name: 'Short Spiky', preview: '🦔', promptValue: 'short spiky' },
    { id: 3, name: 'Braided Crown', preview: '👸', promptValue: 'intricately braided crown' },
    { id: 4, name: 'Undercut', preview: '💈', promptValue: 'modern undercut' },
    { id: 5, name: 'Flowing Locks', preview: '🌊', promptValue: 'majestic flowing' },
    { id: 6, name: 'Mohawk', preview: '🎸', promptValue: 'bold mohawk' },
    { id: 7, name: 'Pixie Cut', preview: '✨', promptValue: 'playful pixie cut' },
    { id: 8, name: 'Ponytail', preview: '🎀', promptValue: 'practical ponytail' },
    { id: 9, name: 'Afro', preview: '☁️', promptValue: 'voluminous afro' },
    { id: 10, name: 'Bald', preview: '🌕', promptValue: 'clean bald' },
    { id: 11, name: 'Dreadlocks', preview: '🦁', promptValue: 'long dreadlocks' },
    { id: 12, name: 'Side Shave', preview: '⚡', promptValue: 'asymmetric side shave' },
  ],

  eyes: [
    { id: 1, name: 'Almond', preview: '👁️', promptValue: 'almond-shaped', description: 'Classic balanced' },
    { id: 2, name: 'Round', preview: '⭕', promptValue: 'round wide', description: 'Youthful look' },
    { id: 3, name: 'Hooded', preview: '😑', promptValue: 'hooded mysterious', description: 'Intense' },
    { id: 4, name: 'Upturned', preview: '😸', promptValue: 'upturned cat-like', description: 'Exotic' },
    { id: 5, name: 'Downturned', preview: '🥺', promptValue: 'downturned gentle', description: 'Melancholic' },
    { id: 6, name: 'Monolid', preview: '😐', promptValue: 'elegant monolid', description: 'Sleek' },
    { id: 7, name: 'Deep Set', preview: '🔮', promptValue: 'deep-set intense', description: 'Brooding' },
    { id: 8, name: 'Wide Set', preview: '👀', promptValue: 'wide-set dreamy', description: 'Open' },
  ],

  nose: [
    { id: 1, name: 'Straight', preview: '📐', promptValue: 'straight' },
    { id: 2, name: 'Aquiline', preview: '🦅', promptValue: 'aquiline noble' },
    { id: 3, name: 'Button', preview: '🔘', promptValue: 'small button' },
    { id: 4, name: 'Roman', preview: '🏛️', promptValue: 'strong Roman' },
    { id: 5, name: 'Snub', preview: '🐽', promptValue: 'upturned snub' },
    { id: 6, name: 'Hawk', preview: '🦅', promptValue: 'prominent hawk' },
    { id: 7, name: 'Nubian', preview: '👃', promptValue: 'wide Nubian' },
    { id: 8, name: 'Greek', preview: '⚱️', promptValue: 'classic Greek' },
  ],

  mouth: [
    { id: 1, name: 'Full Lips', preview: '💋', promptValue: 'full plump' },
    { id: 2, name: 'Thin Lips', preview: '➖', promptValue: 'thin refined' },
    { id: 3, name: 'Cupid Bow', preview: '💘', promptValue: 'defined cupid bow' },
    { id: 4, name: 'Wide Smile', preview: '😄', promptValue: 'wide expressive' },
    { id: 5, name: 'Heart Shape', preview: '❤️', promptValue: 'heart-shaped' },
    { id: 6, name: 'Downturned', preview: '😔', promptValue: 'slightly downturned' },
    { id: 7, name: 'Pouty', preview: '😗', promptValue: 'pouty full' },
    { id: 8, name: 'Smirk', preview: '😏', promptValue: 'asymmetric smirk' },
  ],

  expression: [
    { id: 1, name: 'Neutral', preview: '😐', promptValue: 'neutral calm' },
    { id: 2, name: 'Smile', preview: '😊', promptValue: 'warm smiling' },
    { id: 3, name: 'Smirk', preview: '😏', promptValue: 'confident smirk' },
    { id: 4, name: 'Fierce', preview: '😠', promptValue: 'fierce determined' },
    { id: 5, name: 'Sad', preview: '😢', promptValue: 'melancholic sad' },
    { id: 6, name: 'Surprised', preview: '😮', promptValue: 'surprised wide-eyed' },
    { id: 7, name: 'Determined', preview: '😤', promptValue: 'intensely determined' },
    { id: 8, name: 'Serene', preview: '😌', promptValue: 'peaceful serene' },
  ],

  makeup: [
    { id: 1, name: 'Natural', preview: '🌿', promptValue: 'natural minimal' },
    { id: 2, name: 'Smoky Eye', preview: '💨', promptValue: 'dramatic smoky eye' },
    { id: 3, name: 'Glam', preview: '✨', promptValue: 'glamorous bold' },
    { id: 4, name: 'Gothic', preview: '🖤', promptValue: 'dark gothic' },
    { id: 5, name: 'Tribal', preview: '🔥', promptValue: 'tribal war paint' },
    { id: 6, name: 'Ethereal', preview: '🦋', promptValue: 'ethereal shimmering' },
    { id: 7, name: 'Warrior', preview: '⚔️', promptValue: 'battle-worn war paint' },
    { id: 8, name: 'Fantasy', preview: '🌈', promptValue: 'fantastical colorful' },
  ],

  markings: [
    { id: 1, name: 'None', preview: '✖️', promptValue: '' },
    { id: 2, name: 'Scar (Eye)', preview: '⚔️', promptValue: 'a scar across the eye' },
    { id: 3, name: 'Scar (Cheek)', preview: '🗡️', promptValue: 'a scar on the cheek' },
    { id: 4, name: 'Tribal Tattoo', preview: '🔥', promptValue: 'tribal face tattoos' },
    { id: 5, name: 'Rune Tattoo', preview: '🔮', promptValue: 'mystical rune tattoos' },
    { id: 6, name: 'Freckles', preview: '✨', promptValue: 'natural freckles' },
    { id: 7, name: 'Beauty Mark', preview: '💫', promptValue: 'a beauty mark' },
    { id: 8, name: 'War Paint', preview: '🎭', promptValue: 'ceremonial war paint' },
    { id: 9, name: 'Birthmark', preview: '🌙', promptValue: 'a distinctive birthmark' },
  ],

  accessories: [
    { id: 1, name: 'None', preview: '✖️', promptValue: '' },
    { id: 2, name: 'Glasses', preview: '👓', promptValue: 'elegant glasses' },
    { id: 3, name: 'Monocle', preview: '🧐', promptValue: 'a monocle' },
    { id: 4, name: 'Eye Patch', preview: '🏴‍☠️', promptValue: 'a leather eye patch' },
    { id: 5, name: 'Earrings', preview: '💎', promptValue: 'ornate earrings' },
    { id: 6, name: 'Nose Ring', preview: '🔗', promptValue: 'a nose ring' },
    { id: 7, name: 'Crown', preview: '👑', promptValue: 'a royal crown' },
    { id: 8, name: 'Headband', preview: '🎀', promptValue: 'a headband' },
    { id: 9, name: 'Circlet', preview: '💫', promptValue: 'a golden circlet' },
    { id: 10, name: 'Hood', preview: '🧥', promptValue: 'a mysterious hood' },
  ],

  facialHair: [
    { id: 1, name: 'Clean Shaven', preview: '😶', promptValue: '' },
    { id: 2, name: 'Stubble', preview: '🧔‍♂️', promptValue: 'light stubble' },
    { id: 3, name: 'Full Beard', preview: '🧔', promptValue: 'a full thick beard' },
    { id: 4, name: 'Goatee', preview: '🐐', promptValue: 'a pointed goatee' },
    { id: 5, name: 'Mustache', preview: '👨', promptValue: 'a distinguished mustache' },
    { id: 6, name: 'Sideburns', preview: '🎸', promptValue: 'thick sideburns' },
    { id: 7, name: 'Van Dyke', preview: '🎭', promptValue: 'a Van Dyke beard' },
    { id: 8, name: 'Soul Patch', preview: '🎵', promptValue: 'a soul patch' },
  ],

  skinTone: [
    { id: 1, name: 'Porcelain', preview: '🤍', promptValue: 'porcelain pale' },
    { id: 2, name: 'Ivory', preview: '🏵️', promptValue: 'ivory fair' },
    { id: 3, name: 'Sand', preview: '🏖️', promptValue: 'warm sand' },
    { id: 4, name: 'Honey', preview: '🍯', promptValue: 'golden honey' },
    { id: 5, name: 'Caramel', preview: '🍮', promptValue: 'rich caramel' },
    { id: 6, name: 'Chestnut', preview: '🌰', promptValue: 'warm chestnut' },
    { id: 7, name: 'Espresso', preview: '☕', promptValue: 'deep espresso' },
    { id: 8, name: 'Obsidian', preview: '🖤', promptValue: 'rich obsidian' },
    // Fantasy
    { id: 9, name: 'Elven Silver', preview: '🌙', promptValue: 'ethereal silver' },
    { id: 10, name: 'Orc Green', preview: '🌲', promptValue: 'orcish green' },
    { id: 11, name: 'Demon Red', preview: '🔥', promptValue: 'demonic crimson' },
    { id: 12, name: 'Frost Blue', preview: '❄️', promptValue: 'frost-touched blue' },
  ],

  age: [
    { id: 1, name: 'Child', preview: '👶', promptValue: 'young child' },
    { id: 2, name: 'Teen', preview: '🧒', promptValue: 'teenage' },
    { id: 3, name: 'Young Adult', preview: '🧑', promptValue: 'young adult' },
    { id: 4, name: 'Adult', preview: '👤', promptValue: 'adult' },
    { id: 5, name: 'Middle Age', preview: '🧔', promptValue: 'middle-aged' },
    { id: 6, name: 'Elder', preview: '👴', promptValue: 'elderly wise' },
  ],

  bodyType: [
    { id: 1, name: 'Slim', preview: '🏃', promptValue: 'slim lean' },
    { id: 2, name: 'Athletic', preview: '🏋️', promptValue: 'athletic toned' },
    { id: 3, name: 'Muscular', preview: '💪', promptValue: 'heavily muscular' },
    { id: 4, name: 'Average', preview: '🧍', promptValue: 'average' },
    { id: 5, name: 'Stocky', preview: '🪨', promptValue: 'stocky sturdy' },
    { id: 6, name: 'Heavy', preview: '🐻', promptValue: 'large heavy-set' },
  ],

  lighting: [
    { id: 1, name: 'Studio', preview: '💡', promptValue: 'professional studio' },
    { id: 2, name: 'Golden Hour', preview: '🌅', promptValue: 'warm golden hour' },
    { id: 3, name: 'Moonlight', preview: '🌙', promptValue: 'ethereal moonlight' },
    { id: 4, name: 'Dramatic', preview: '🎭', promptValue: 'dramatic chiaroscuro' },
    { id: 5, name: 'Neon', preview: '🌈', promptValue: 'vibrant neon' },
    { id: 6, name: 'Candlelight', preview: '🕯️', promptValue: 'intimate candlelight' },
  ],

  background: [
    { id: 1, name: 'Transparent', preview: '🔲', promptValue: '' },
    { id: 2, name: 'Studio Gray', preview: '⬛', promptValue: 'neutral gray studio' },
    { id: 3, name: 'Deep Black', preview: '🖤', promptValue: 'pure black' },
    { id: 4, name: 'Gradient Blue', preview: '🌊', promptValue: 'gradient blue atmospheric' },
    { id: 5, name: 'Fantasy Forest', preview: '🌲', promptValue: 'mystical forest' },
    { id: 6, name: 'Castle Interior', preview: '🏰', promptValue: 'medieval castle interior' },
  ],
};

export const getOptionsForCategory = (categoryId: CategoryId): CategoryOption[] =>
  CATEGORY_OPTIONS[categoryId] || [];

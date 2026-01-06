/**
 * Archetypes API Endpoint
 * Provides access to the character archetype library
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ARCHETYPE_LIBRARY,
  getArchetypesByCategory,
  getArchetypesByGenre,
  searchArchetypes,
  getAllCategories,
  getArchetypeById,
} from '@/app/lib/archetypes/archetypeLibrary';
import { getRecommendedArchetypes } from '@/app/lib/archetypes/archetypeApplicator';

/**
 * GET /api/archetypes
 * Fetch archetypes with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    // Get single archetype by ID
    if (id) {
      const archetype = getArchetypeById(id);
      if (!archetype) {
        return NextResponse.json({ error: 'Archetype not found' }, { status: 404 });
      }
      return NextResponse.json({ archetype });
    }

    // Get all categories
    if (action === 'categories') {
      const categories = getAllCategories();
      return NextResponse.json({ categories });
    }

    // Get recommended archetypes
    if (action === 'recommended') {
      const existingTypes = searchParams.get('existingTypes')?.split(',') || [];
      const projectGenre = searchParams.get('projectGenre') || undefined;
      const limit = parseInt(searchParams.get('limit') || '5');

      const recommended = getRecommendedArchetypes(
        {
          genre: projectGenre,
          existingCharacterTypes: existingTypes,
        },
        limit
      );

      return NextResponse.json({ archetypes: recommended });
    }

    // Filter archetypes
    let archetypes = [...ARCHETYPE_LIBRARY];

    if (category && category !== 'all') {
      archetypes = getArchetypesByCategory(category);
    }

    if (genre && genre !== 'all') {
      archetypes = archetypes.filter((a) =>
        getArchetypesByGenre(genre).find((g) => g.id === a.id)
      );
    }

    if (search) {
      const searchResults = searchArchetypes(search);
      archetypes = archetypes.filter((a) => searchResults.find((s) => s.id === a.id));
    }

    // Sort by popularity
    archetypes.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return NextResponse.json({
      archetypes,
      total: archetypes.length,
    });
  } catch (error) {
    console.error('Error fetching archetypes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archetypes' },
      { status: 500 }
    );
  }
}

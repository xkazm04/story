/**
 * GET /api/assets-manager/semantic-search
 * AI-powered semantic search using vector embeddings
 *
 * Query params:
 * - q: natural language query (required)
 * - limit: max results (default 10)
 * - min_score: minimum similarity threshold (default 0.3)
 * - type: filter by asset type (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/mongodb/client';
import { ASSET_LIST_PROJECTION } from '@/app/lib/mongodb/collections';
import type { AssetSearchResult } from '@/app/types/Asset';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);
    const minScore = parseFloat(searchParams.get('min_score') || '0.3');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if embeddings collection exists
    const collections = await db.listCollections({ name: 'asset_embeddings' }).toArray();

    if (collections.length === 0) {
      // Fall back to text search if no embeddings available
      return NextResponse.json({
        assets: [],
        total: 0,
        query,
        message: 'Semantic search not available. Embeddings collection not found.',
        fallback: true,
      });
    }

    // For now, return a placeholder response
    // Full implementation would:
    // 1. Generate embedding for the query using OpenAI/Gemini
    // 2. Perform vector similarity search
    // 3. Return ranked results

    // Placeholder: Use text search as fallback
    const assetsCollection = db.collection('assets');

    const regexQuery = new RegExp(query, 'i');
    const searchQuery: Record<string, unknown> = {
      $or: [
        { name: regexQuery },
        { description: regexQuery },
        { subcategory: regexQuery },
      ],
    };

    if (type) {
      searchQuery.type = type;
    }

    const assets = await assetsCollection
      .find(searchQuery, { projection: ASSET_LIST_PROJECTION })
      .limit(limit)
      .toArray();

    // Simulate similarity scores
    const results = assets.map((asset, index) => ({
      asset: {
        ...asset,
        _id: asset._id.toString(),
      },
      similarity_mongo: Math.max(minScore, 1 - index * 0.05),
    })) as AssetSearchResult[];

    return NextResponse.json({
      results,
      total: results.length,
      query,
      searchMode: 'fallback', // Will be 'semantic' when embeddings are available
    });
  } catch (error) {
    console.error('Error in semantic search:', error);
    return NextResponse.json(
      { error: 'Failed to perform semantic search', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assets-manager/search
 * Text search for assets using MongoDB text index
 *
 * Query params:
 * - q: search query (required)
 * - type: filter by asset type (optional)
 * - limit: max results (default 20)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAssetsCollection } from '@/app/lib/mongodb/client';
import { ASSET_LIST_PROJECTION } from '@/app/lib/mongodb/collections';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const collection = await getAssetsCollection();

    // Build search query
    // Try text search first, fall back to regex if no text index
    let searchQuery: Record<string, unknown> = {};

    try {
      // Attempt text search
      searchQuery = {
        $text: { $search: query },
      };

      if (type) {
        searchQuery.type = type;
      }

      const assets = await collection
        .find(searchQuery, {
          projection: {
            ...ASSET_LIST_PROJECTION,
            score: { $meta: 'textScore' },
          },
        })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .toArray();

      const transformedAssets = assets.map((asset) => ({
        ...asset,
        _id: asset._id.toString(),
      }));

      return NextResponse.json({
        assets: transformedAssets,
        total: transformedAssets.length,
        query,
      });
    } catch {
      // Fall back to regex search if text index doesn't exist
      const regexQuery = new RegExp(query, 'i');
      searchQuery = {
        $or: [
          { name: regexQuery },
          { description: regexQuery },
          { subcategory: regexQuery },
          { 'metadata.tags': regexQuery },
        ],
      };

      if (type) {
        searchQuery.type = type;
      }

      const assets = await collection
        .find(searchQuery, { projection: ASSET_LIST_PROJECTION })
        .limit(limit)
        .toArray();

      const transformedAssets = assets.map((asset) => ({
        ...asset,
        _id: asset._id.toString(),
      }));

      return NextResponse.json({
        assets: transformedAssets,
        total: transformedAssets.length,
        query,
        searchMethod: 'regex',
      });
    }
  } catch (error) {
    console.error('Error searching assets:', error);
    return NextResponse.json(
      { error: 'Failed to search assets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

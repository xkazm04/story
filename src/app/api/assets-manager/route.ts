/**
 * GET /api/assets-manager
 * Get paginated assets from MongoDB
 *
 * Query params:
 * - category: 'character' | 'story' (optional)
 * - type: AssetType (optional)
 * - page: number (default 1)
 * - limit: number (default 24)
 * - sortBy: 'created_at' | 'name' | 'type' (default 'created_at')
 * - sortOrder: 'asc' | 'desc' (default 'desc')
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAssetsCollection } from '@/app/lib/mongodb/client';
import { ASSET_LIST_PROJECTION } from '@/app/lib/mongodb/collections';
import type { Asset, PaginatedAsset } from '@/app/types/Asset';

// Character and story type mappings
const CHARACTER_TYPES = ['body', 'equipment', 'clothing', 'background'];
const STORY_TYPES = ['scenes', 'props', 'locations'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const collection = await getAssetsCollection();

    // Build query
    const query: Record<string, unknown> = {};

    if (type) {
      query.type = type;
    } else if (category === 'character') {
      query.type = { $in: CHARACTER_TYPES };
    } else if (category === 'story') {
      query.type = { $in: STORY_TYPES };
    }

    // Get total count
    const totalAssets = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalAssets / limit);

    // Get paginated assets
    const assets = await collection
      .find(query, { projection: ASSET_LIST_PROJECTION })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Transform _id to string and cast to Asset type
    const transformedAssets = assets.map((asset) => ({
      ...asset,
      _id: asset._id.toString(),
    })) as unknown as Asset[];

    const response: PaginatedAsset = {
      assets: transformedAssets,
      total_assets: totalAssets,
      total_pages: totalPages,
      current_page: page,
      page_size: limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets-manager
 * Create a new asset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, subcategory, gen, description, image_url, metadata } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const collection = await getAssetsCollection();

    const newAsset = {
      name,
      type,
      subcategory: subcategory || '',
      gen: gen || '',
      description: description || '',
      image_url: image_url || '',
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await collection.insertOne(newAsset);

    return NextResponse.json(
      { ...newAsset, _id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assets-manager/categories
 * Get asset counts by type
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAssetsCollection } from '@/app/lib/mongodb/client';
import type { CategoryCounts } from '@/app/features/assets/types';

export async function GET(request: NextRequest) {
  void request; // Unused but required for route handler signature

  try {
    const collection = await getAssetsCollection();

    // Aggregate counts by type
    const typeCounts = await collection
      .aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Build response structure
    const byType: Record<string, number> = {};
    let total = 0;

    for (const { _id: type, count } of typeCounts) {
      total += count;
      byType[type] = count;
    }

    const response: CategoryCounts = {
      byType,
      total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category counts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

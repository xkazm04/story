import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { backgroundJobProcessor } from '@/app/services/backgroundJobProcessor';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * GET /api/cron/process-appearance-changes
 * Cron job endpoint to process pending appearance changes
 * Can be called by external cron service (e.g., Vercel Cron, GitHub Actions)
 *
 * For security, this should be protected by a secret key in production
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron job attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    logger.info('Cron job started: process-appearance-changes');

    const result = await backgroundJobProcessor.processPendingChanges();

    logger.info('Cron job completed: process-appearance-changes', { result } as Record<string, unknown>);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error) {
    logger.error('Error in cron job: process-appearance-changes', { error } as Record<string, unknown>);
    return NextResponse.json(
      {
        error: 'Failed to process pending changes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/cron/process-appearance-changes
 * Manually trigger the cron job
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

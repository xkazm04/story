import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';
import { appearancePropagationService } from '@/app/services/appearancePropagationService';
import { narrativeSynthesisService } from '@/app/services/narrativeSynthesisService';

/**
 * POST /api/appearance-propagation/process
 * Process a single appearance change and propagate to story elements
 * This is the background job endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { change_log_id } = body;

    if (!change_log_id) {
      return createErrorResponse('change_log_id is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Update status to processing
    await appearancePropagationService.updatePropagationStatus(change_log_id, 'processing');

    try {
      // Get the change log
      const changeLogs = await appearancePropagationService.getPendingChanges();
      const changeLog = changeLogs.find((log) => log.id === change_log_id);

      if (!changeLog) {
        throw new Error('Change log not found');
      }

      // Get character details
      const character = await appearancePropagationService.getCharacterDetails(
        changeLog.character_id
      );
      if (!character) {
        throw new Error('Character not found');
      }

      // Get character appearance
      const appearance = await appearancePropagationService.getCharacterAppearance(
        changeLog.character_id
      );
      if (!appearance) {
        throw new Error('Character appearance not found');
      }

      // Find story elements that need updating
      const targets = await appearancePropagationService.findPropagationTargets(
        changeLog.character_id,
        changeLog.project_id
      );

      // Create propagation targets
      await appearancePropagationService.createPropagationTargets(
        change_log_id,
        changeLog.character_id,
        targets
      );

      // Build character context for LLM
      const characterContext = {
        name: character.name,
        type: character.type,
        appearance,
        changedFields: Array.isArray(changeLog.changed_fields)
          ? changeLog.changed_fields
          : [],
        oldValues: changeLog.old_values || {},
        newValues: changeLog.new_values || {},
      };

      // Process each target
      const propagationTargets = await appearancePropagationService.getPropagationTargets(
        change_log_id
      );

      let successCount = 0;
      let failureCount = 0;

      for (const target of propagationTargets) {
        try {
          // Synthesize updated content using LLM
          const update = await narrativeSynthesisService.synthesizeUpdate(
            target.target_type,
            characterContext,
            target.original_content || ''
          );

          // Validate the update
          const isValid = narrativeSynthesisService.validateUpdate(
            update.originalContent,
            update.updatedContent
          );

          if (!isValid) {
            logger.warn('Update validation failed for target', { targetId: target.id });
            await appearancePropagationService.updatePropagationTarget(
              target.id,
              update.updatedContent,
              'failed'
            );
            failureCount++;
            continue;
          }

          // Update the target with new content
          await appearancePropagationService.updatePropagationTarget(
            target.id,
            update.updatedContent,
            'completed'
          );

          successCount++;
        } catch (error) {
          logger.error('Error processing propagation target', error, { targetId: target.id });
          failureCount++;
        }
      }

      // Update change log status
      if (failureCount === 0) {
        await appearancePropagationService.updatePropagationStatus(change_log_id, 'completed');
      } else if (successCount === 0) {
        await appearancePropagationService.updatePropagationStatus(
          change_log_id,
          'failed',
          `All targets failed to process`
        );
      } else {
        await appearancePropagationService.updatePropagationStatus(
          change_log_id,
          'completed',
          `Partial success: ${successCount} succeeded, ${failureCount} failed`
        );
      }

      return NextResponse.json({
        success: true,
        changeLogId: change_log_id,
        targetsProcessed: propagationTargets.length,
        successCount,
        failureCount,
      });
    } catch (error) {
      // Mark as failed and increment retry count
      await appearancePropagationService.updatePropagationStatus(
        change_log_id,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      await appearancePropagationService.incrementRetryCount(change_log_id);
      throw error;
    }
  } catch (error) {
    logger.error('Error in POST /api/appearance-propagation/process', error);
    return createErrorResponse('Failed to process appearance propagation', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

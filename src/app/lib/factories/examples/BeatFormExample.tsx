/**
 * Beat Form Example
 *
 * Demonstrates how to use the Schema-Based UI Component Factory
 * to generate form components for creating and editing beats.
 */

'use client';

import React, { useState } from 'react';
import { useSchemaForm } from '../hooks/useSchemaForm';
import { beatSchema } from '../schemas/beatSchema';
import { Beat } from '@/app/types/Beat';

// Example: Create new beat form
export function CreateBeatForm({ projectId, onSuccess }: {
  projectId: string;
  onSuccess?: (beat: Partial<Beat>) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (beatData: Partial<Beat>) => {
    setIsSubmitting(true);
    try {
      // Add project_id
      const fullData = { ...beatData, project_id: projectId };

      console.log('Creating beat:', fullData);
      // Call your API here
      // await createBeat(fullData);

      if (onSuccess) {
        onSuccess(fullData);
      }
    } catch (error) {
      console.error('Failed to create beat:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { render } = useSchemaForm({
    schema: beatSchema,
    mode: 'create',
    options: {
      layout: 'grid',
      columns: 2,
      showValidation: true,
      sections: [
        {
          id: 'basic',
          title: 'Basic Information',
          description: 'Essential beat details',
          fields: ['name', 'type', 'description'],
        },
        {
          id: 'planning',
          title: 'Planning',
          description: 'Order and duration estimates',
          fields: ['order', 'duration', 'estimated_duration'],
          collapsible: true,
          defaultOpen: false,
        },
        {
          id: 'metadata',
          title: 'Metadata',
          description: 'Additional beat metadata',
          fields: ['paragraph_id', 'paragraph_title', 'default_flag'],
          collapsible: true,
          defaultOpen: false,
        },
      ],
      submitLabel: 'Create Beat',
      showCancel: true,
    },
    onSubmit: handleSubmit,
    loading: isSubmitting,
    testId: 'create-beat-form',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-200">Create New Beat</h2>
      {render()}
    </div>
  );
}

// Example: Edit existing beat form
export function EditBeatForm({ beat, onSuccess, onCancel }: {
  beat: Beat;
  onSuccess?: (beat: Beat) => void;
  onCancel?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (updates: Partial<Beat>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Updating beat:', beat.id, updates);
      // Call your API here
      // const updated = await updateBeat(beat.id, updates);

      if (onSuccess) {
        onSuccess({ ...beat, ...updates });
      }
    } catch (err) {
      console.error('Failed to update beat:', err);
      setError(err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { render } = useSchemaForm({
    schema: beatSchema,
    entity: beat,
    mode: 'edit',
    options: {
      layout: 'vertical',
      showValidation: true,
      submitLabel: 'Save Changes',
      showCancel: true,
      showReset: true,
    },
    onSubmit: handleSubmit,
    onCancel: onCancel,
    loading: isSubmitting,
    error: error,
    testId: 'edit-beat-form',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-200">Edit Beat: {beat.name}</h2>
      {render()}
    </div>
  );
}

// Example: View-only beat details
export function ViewBeatDetails({ beat }: { beat: Beat }) {
  const { render } = useSchemaForm({
    schema: beatSchema,
    entity: beat,
    mode: 'view',
    options: {
      layout: 'grid',
      columns: 2,
      showLabels: true,
    },
    testId: 'view-beat-details',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-200">Beat Details</h2>
      {render()}
    </div>
  );
}

// Example: Form with custom validation
export function BeatFormWithValidation({ projectId }: { projectId: string }) {
  const [existingNames, setExistingNames] = useState<string[]>([
    'Opening Scene',
    'Inciting Incident',
  ]);

  // Create a custom schema with additional validation
  const customBeatSchema = {
    ...beatSchema,
    fields: beatSchema.fields.map((field) => {
      if (field.key === 'name') {
        return {
          ...field,
          validations: [
            ...(field.validations || []),
            {
              type: 'custom' as const,
              validator: (value: string) => !existingNames.includes(value),
              message: 'A beat with this name already exists',
            },
          ],
        };
      }
      return field;
    }),
  };

  const { render } = useSchemaForm({
    schema: customBeatSchema,
    mode: 'create',
    options: {
      showValidation: true,
      submitLabel: 'Create Beat',
    },
    onSubmit: async (beat) => {
      console.log('Creating beat:', beat);
      // Add to existing names
      if (beat.name) {
        setExistingNames((prev) => [...prev, beat.name!]);
      }
    },
    testId: 'beat-form-validation',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-200">Create Beat (With Validation)</h2>
      <p className="text-sm text-gray-400">
        Existing beat names: {existingNames.join(', ')}
      </p>
      {render()}
    </div>
  );
}

// Example: Modal form wrapper
export function BeatFormModal({ isOpen, onClose, beat, projectId }: {
  isOpen: boolean;
  onClose: () => void;
  beat?: Beat;
  projectId: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {beat ? (
          <EditBeatForm
            beat={beat}
            onSuccess={() => onClose()}
            onCancel={onClose}
          />
        ) : (
          <CreateBeatForm
            projectId={projectId}
            onSuccess={() => onClose()}
          />
        )}
      </div>
    </div>
  );
}

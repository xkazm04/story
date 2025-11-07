'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/app/components/UI/Modal';
import { Input } from '@/app/components/UI/Input';
import { Textarea } from '@/app/components/UI/Textarea';
import { Button } from '@/app/components/UI/Button';
import { Edit, Sparkles, Loader2, Save } from 'lucide-react';
import { Project } from '@/app/types/Project';
import { projectApi } from '@/app/hooks/integration/useProjects';
import { useLLM } from '@/app/hooks/useLLM';
import { projectInspirationPrompt } from '@/prompts';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { actApi } from '@/app/hooks/integration/useActs';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { useQueryClient } from '@tanstack/react-query';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ isOpen, onClose, project }) => {
  const queryClient = useQueryClient();
  const { setSelectedProject } = useProjectStore();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { generate, isLoading: isGenerating } = useLLM();

  const { mutateAsync: updateProject } = projectApi.useUpdateProject();

  // Get project stats for AI context
  const { data: acts = [] } = actApi.useProjectActs(project.id, true);
  const { data: scenes = [] } = sceneApi.useProjectScenes(project.id, true);

  // Reset form when project changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description || '');
    setError(null);
    setSuccessMessage(null);
  }, [project]);

  const handleGenerateInspiration = async () => {
    setError(null);
    setSuccessMessage(null);

    const context = {
      currentDescription: description,
      projectName: name,
      genre: project.type,
      existingElements: {
        characterCount: 0, // TODO: Add when character count is available
        actCount: acts.length,
        sceneCount: scenes.length,
      },
    };

    const response = await generate(
      projectInspirationPrompt.user(context),
      projectInspirationPrompt.system
    );

    if (response && response.content) {
      setDescription(response.content.trim());
      setSuccessMessage('AI inspiration generated! Review and edit as needed.');
    } else {
      setError('Failed to generate inspiration. Please try again.');
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSaving(true);

    try {
      const updatedProject = await updateProject({
        id: project.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      });

      // Update the selected project in store
      setSelectedProject(updatedProject);

      // Invalidate and refetch project queries
      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      setSuccessMessage('Project updated successfully!');

      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        onClick={onClose}
        disabled={isSaving || isGenerating}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={isSaving || isGenerating || !name.trim()}
        icon={isSaving ? <Loader2 className="animate-spin" /> : <Save />}
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project"
      subtitle={`Update your project details and generate AI-powered inspiration`}
      icon={<Edit size={16} />}
      size="lg"
      footer={footer}
      closeOnBackdropClick={!isSaving && !isGenerating}
    >
      <div className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="px-4 py-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {successMessage}
          </div>
        )}

        {/* Project Name */}
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name..."
          disabled={isSaving || isGenerating}
          required
          fullWidth
        />

        {/* Project Description with AI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Description
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateInspiration}
              disabled={isSaving || isGenerating}
              icon={isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            >
              {isGenerating ? 'Generating...' : 'AI Inspire'}
            </Button>
          </div>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your story project... Click 'AI Inspire' to generate ideas based on your thoughts!"
            disabled={isSaving || isGenerating}
            fullWidth
            size="lg"
            rows={8}
            showCharCount
          />

          <p className="text-xs text-gray-500 italic">
            Tip: Write a few words about your story idea, then use AI Inspire to expand it into a full description.
          </p>
        </div>

        {/* Project Stats */}
        {(acts.length > 0 || scenes.length > 0) && (
          <div className="px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400 font-medium mb-2">Current Project Stats:</p>
            <div className="flex items-center gap-4 text-sm">
              {acts.length > 0 && (
                <span className="text-gray-300">
                  <span className="text-blue-400 font-bold">{acts.length}</span> Act{acts.length !== 1 ? 's' : ''}
                </span>
              )}
              {scenes.length > 0 && (
                <span className="text-gray-300">
                  <span className="text-purple-400 font-bold">{scenes.length}</span> Scene{scenes.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProjectEditModal;

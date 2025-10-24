'use client';

import { projectApi } from "@/app/api/projects";
import { MOCK_USER_ID } from "@/app/config/mockUser";

type Props = {
    userId?: string;
    onProjectCreated?: () => void;
}

const LandingProjectCreate = ({ userId = MOCK_USER_ID, onProjectCreated }: Props) => {
    const createProjectMutation = projectApi.useCreateProject();

    const handleProjectCreate = async () => {
        createProjectMutation.mutate(
            {
                name: 'New Project',
                user_id: userId,
                description: '',
                type: 'story',
            },
            {
                onSuccess: () => {
                    if (onProjectCreated) {
                        onProjectCreated();
                    }
                },
                onError: () => {
                    console.error('Error creating project');
                }
            }
        );
    }

    return (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-8">
            <button 
                onClick={handleProjectCreate}
                disabled={createProjectMutation.isPending}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project +'}
            </button>
        </div>
    );
}

export default LandingProjectCreate


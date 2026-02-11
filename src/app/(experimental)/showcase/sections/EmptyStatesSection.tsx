'use client';

import {
  ImageIcon, Users, MicOff, Folder, Package, FolderOpen, Film,
  Network, AlertCircle, Database, FileText, Search, Filter,
  History, Upload, Palette, Link2, Sparkles, Plus
} from 'lucide-react';
import { EmptyState } from '@/app/components/UI/EmptyState';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function EmptyStatesSection() {
  const noop = () => {};

  return (
    <ShowcaseSection
      id="empty-states"
      title="Empty States"
      description="All features now use UI/EmptyState"
      count={18}
    >
      {/* Core EmptyState variants */}
      <ShowcaseItem label="Default variant" source="UI/EmptyState">
        <EmptyState
          icon={<ImageIcon />}
          title="No images generated yet"
          subtitle="Create your first image to get started."
          action={{ label: "Create Image", onClick: noop, icon: <Plus /> }}
        />
      </ShowcaseItem>

      <ShowcaseItem label="Compact variant" source="UI/EmptyState">
        <EmptyState
          icon={<Users />}
          title="No characters found"
          subtitle="Add characters to your project to assign voices"
          variant="compact"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Centered variant" source="UI/EmptyState">
        <EmptyState
          icon={<Database />}
          title="No Project Selected"
          subtitle="Select a project to manage datasets"
          variant="centered"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Link action variant" source="UI/EmptyState">
        <EmptyState
          icon={<FileText />}
          title="No scenes yet"
          action={{ label: "Create your first scene", onClick: noop, variant: 'link' }}
          variant="compact"
        />
      </ShowcaseItem>

      {/* Animated + glow (Vibeman-inspired) */}
      <ShowcaseItem label="Animated + glow + secondaryAction" source="UI/EmptyState">
        <EmptyState
          icon={<Sparkles />}
          title="No Projects Yet"
          subtitle="Start your storytelling journey"
          action={{ label: "Create Project", onClick: noop, icon: <Plus /> }}
          secondaryAction={{ label: "Browse templates", onClick: noop }}
          animated
          glowColor="rgb(34, 211, 238)"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Animated purple glow" source="UI/EmptyState">
        <EmptyState
          icon={<Database />}
          title="No Datasets"
          subtitle="Upload or create a dataset to get started"
          action={{ label: "New Dataset", onClick: noop, icon: <Plus /> }}
          animated
          glowColor="rgb(168, 85, 247)"
        />
      </ShowcaseItem>

      {/* monoLabel (code-comment style from Characters) */}
      <ShowcaseItem label="monoLabel code-comment" source="UI/EmptyState">
        <EmptyState
          icon={<Network />}
          title="Select a Project"
          monoLabel="// select_project_to_view"
          variant="compact"
          iconSize="sm"
        />
      </ShowcaseItem>

      <ShowcaseItem label="monoLabel + subtitle" source="UI/EmptyState">
        <EmptyState
          icon={<FileText />}
          title="Select a Character"
          monoLabel="// select_character_to_view"
          subtitle="select a character to view details, generate images, or create avatars"
          variant="compact"
          iconSize="sm"
        />
      </ShowcaseItem>

      {/* Migrated feature patterns — all now use EmptyState */}
      <ShowcaseItem label="Voice: no voices (migrated)" source="features/voice/VoiceList.tsx">
        <EmptyState
          icon={<MicOff />}
          title="No voices yet"
          subtitle="Create your first voice using the Voice Extraction tab"
          iconSize="lg"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Projects: no projects (migrated)" source="features/projects/ProjectsFeature.tsx">
        <EmptyState
          icon={<Folder />}
          title="No Projects Yet"
          subtitle="Start your storytelling journey by creating your first project"
          action={{ label: "Create Your First Project", onClick: noop, icon: <Plus /> }}
          iconSize="lg"
          animated
          glowColor="rgb(59, 130, 246)"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Characters: select project (migrated)" source="features/characters/CharactersFeature.tsx">
        <EmptyState
          icon={<Network />}
          title="Select a Project"
          monoLabel="// select_project_to_view"
          variant="compact"
          iconSize="sm"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Assets: no assets (migrated)" source="features/assets/ManagerPanel.tsx">
        <EmptyState
          icon={<Package />}
          title="No assets found"
          subtitle="Try adjusting your filters or upload new assets"
          variant="compact"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Assets: no asset selected (migrated)" source="features/assets/AssetRightPanel.tsx">
        <EmptyState
          icon={<ImageIcon />}
          title="No Asset Selected"
          subtitle="Click on an asset in the grid to view its details here"
          variant="centered"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Assets: no collections (migrated)" source="features/assets/CollectionPanel.tsx">
        <EmptyState
          icon={<FolderOpen />}
          title="No collections yet"
          subtitle="Create a collection to organize your assets"
          action={{ label: "Create Collection", onClick: noop, icon: <Plus /> }}
          variant="compact"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Relationships: empty (migrated)" source="features/relationships/RelationshipMap.tsx">
        <EmptyState
          icon={<AlertCircle />}
          title="No Relationships Found"
          subtitle="Create some characters and factions, then add relationships between them to see them visualized here."
          iconSize="lg"
          animated
          glowColor="rgb(148, 163, 184)"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Story Script: no scenes (migrated)" source="features/story/StoryScript.tsx">
        <EmptyState
          icon={<Film />}
          title="No scenes available"
          subtitle="Create acts and scenes to start writing your script"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Search: no results (migrated)" source="features/characters/SemanticSearchPanel.tsx">
        <EmptyState
          icon={<Search />}
          title='No results found for "dragon"'
          subtitle="Try different keywords or adjust filters"
          iconSize="lg"
        />
      </ShowcaseItem>

      <ShowcaseItem label="secondaryAction pattern" source="UI/EmptyState">
        <EmptyState
          icon={<FolderOpen />}
          title="No collections yet"
          subtitle="Create collections to organize your assets"
          action={{ label: "Create Collection", onClick: noop, icon: <Plus /> }}
          secondaryAction={{ label: "Import from template", onClick: noop }}
          variant="compact"
        />
      </ShowcaseItem>
    </ShowcaseSection>
  );
}

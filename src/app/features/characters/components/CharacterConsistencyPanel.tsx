'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  MessageSquare,
  Users,
  Target,
  Edit3,
} from 'lucide-react';
import { useAnalyzeConsistency, useResolveConsistencyIssue } from '@/app/hooks/useCharacterConsistency';
import {
  ConsistencyIssue,
  ConsistencyIssueType,
  ConsistencySeverity,
  CharacterConsistencyReport,
} from '@/app/types/CharacterConsistency';
import ColoredBorder from '@/app/components/UI/ColoredBorder';
import { useProjectStore } from '@/app/store/slices/projectSlice';

interface CharacterConsistencyPanelProps {
  characterId: string;
  characterName: string;
}

const severityColors = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const severityIcons = {
  critical: XCircle,
  high: AlertTriangle,
  medium: AlertTriangle,
  low: Shield,
};

const issueTypeLabels: Record<ConsistencyIssueType, string> = {
  personality_conflict: 'Personality Conflict',
  motivation_conflict: 'Motivation Conflict',
  speech_pattern_conflict: 'Speech Pattern Conflict',
  behavior_conflict: 'Behavior Conflict',
  trait_conflict: 'Trait Conflict',
};

const issueTypeIcons: Record<ConsistencyIssueType, React.ComponentType<any>> = {
  personality_conflict: Users,
  motivation_conflict: Target,
  speech_pattern_conflict: MessageSquare,
  behavior_conflict: Users,
  trait_conflict: Sparkles,
};

const sourceTypeIcons = {
  beat: FileText,
  scene: FileText,
  trait: Sparkles,
  backstory: MessageSquare,
};

const CharacterConsistencyPanel: React.FC<CharacterConsistencyPanelProps> = ({
  characterId,
  characterName,
}) => {
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const [report, setReport] = useState<CharacterConsistencyReport | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [resolvingIssue, setResolvingIssue] = useState<string | null>(null);

  const analyzeConsistency = useAnalyzeConsistency();
  const resolveIssue = useResolveConsistencyIssue();

  const handleAnalyze = async () => {
    if (!selectedProject) return;

    const result = await analyzeConsistency.mutateAsync({
      character_id: characterId,
      project_id: selectedProject.id,
      include_beats: true,
      include_scenes: true,
      include_traits: true,
    });

    setReport(result);
  };

  const handleResolveIssue = async (
    issueId: string,
    resolutionType: 'accept_suggestion' | 'custom_edit' | 'ignore',
    customResolution?: string
  ) => {
    setResolvingIssue(issueId);
    try {
      await resolveIssue.mutateAsync({
        issue_id: issueId,
        resolution_type: resolutionType,
        custom_resolution: customResolution,
      });

      // Remove issue from report
      if (report) {
        const updatedIssues = report.issues.filter(i => i.id !== issueId);
        setReport({
          ...report,
          issues: updatedIssues,
          total_issues: updatedIssues.length,
        });
      }
    } finally {
      setResolvingIssue(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBorderColor = (score: number): 'blue' | 'green' | 'purple' | 'yellow' | 'pink' | 'orange' | 'gray' => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'blue';
    if (score >= 50) return 'yellow';
    if (score >= 30) return 'orange';
    return 'gray';
  };

  return (
    <div className="space-y-4">
      {/* Header and Analyze Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Character Consistency</h3>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzeConsistency.isPending || !selectedProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
          data-testid="analyze-consistency-btn"
        >
          {analyzeConsistency.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Consistency
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {report && (
        <div className="space-y-4">
          {/* Consistency Score */}
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
            <ColoredBorder color={getScoreBorderColor(report.consistency_score)} />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400">Overall Consistency Score</h4>
                <p className={`text-4xl font-bold ${getScoreColor(report.consistency_score)}`}>
                  {report.consistency_score}
                  <span className="text-xl text-gray-500">/100</span>
                </p>
              </div>
              <div className="text-right text-sm text-gray-400">
                <div>Analyzed: {report.analyzed_sources.beats_count} beats</div>
                <div>{report.analyzed_sources.scenes_count} scenes</div>
                <div>{report.analyzed_sources.traits_count} traits</div>
              </div>
            </div>

            {/* Issue Summary */}
            <div className="grid grid-cols-4 gap-3">
              {report.critical_issues > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs text-red-400 mb-1">Critical</div>
                  <div className="text-2xl font-bold text-red-400">{report.critical_issues}</div>
                </div>
              )}
              {report.high_issues > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="text-xs text-orange-400 mb-1">High</div>
                  <div className="text-2xl font-bold text-orange-400">{report.high_issues}</div>
                </div>
              )}
              {report.medium_issues > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="text-xs text-yellow-400 mb-1">Medium</div>
                  <div className="text-2xl font-bold text-yellow-400">{report.medium_issues}</div>
                </div>
              )}
              {report.low_issues > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-xs text-blue-400 mb-1">Low</div>
                  <div className="text-2xl font-bold text-blue-400">{report.low_issues}</div>
                </div>
              )}
            </div>
          </div>

          {/* Issues List */}
          {report.issues.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                Detected Issues ({report.total_issues})
              </h4>
              {report.issues.map((issue) => {
                const SeverityIcon = severityIcons[issue.severity];
                const IssueTypeIcon = issueTypeIcons[issue.issue_type];
                const Source1Icon = sourceTypeIcons[issue.source_1.type];
                const Source2Icon = sourceTypeIcons[issue.source_2.type];
                const isExpanded = expandedIssue === issue.id;

                return (
                  <div
                    key={issue.id}
                    className={`relative bg-gray-900 rounded-lg border ${severityColors[issue.severity]} overflow-hidden`}
                    data-testid={`consistency-issue-${issue.id}`}
                  >
                    <ColoredBorder color={issue.severity === 'critical' ? 'gray' : issue.severity === 'high' ? 'orange' : issue.severity === 'medium' ? 'yellow' : 'blue'} />

                    {/* Issue Header */}
                    <button
                      onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors"
                      data-testid={`expand-issue-${issue.id}-btn`}
                    >
                      <SeverityIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <IssueTypeIcon className="w-4 h-4" />
                          <span className="text-sm font-semibold text-white">
                            {issueTypeLabels[issue.issue_type]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.round(issue.confidence_score * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{issue.description}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400" />
                      )}
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
                            {/* Conflicting Sources */}
                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Source1Icon className="w-4 h-4" />
                                  {issue.source_1.type}: {issue.source_1.name}
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300">
                                  "{issue.conflicting_text_1}"
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <Source2Icon className="w-4 h-4" />
                                  {issue.source_2.type}: {issue.source_2.name}
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-3 text-sm text-gray-300">
                                  "{issue.conflicting_text_2}"
                                </div>
                              </div>
                            </div>

                            {/* AI Reasoning */}
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                              <div className="text-xs font-semibold text-blue-400 mb-2">
                                AI Analysis
                              </div>
                              <p className="text-sm text-gray-300">{issue.ai_reasoning}</p>
                            </div>

                            {/* Suggested Resolution */}
                            {issue.suggested_resolution && (
                              <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                                <div className="text-xs font-semibold text-green-400 mb-2">
                                  Suggested Resolution
                                </div>
                                <p className="text-sm text-gray-300">{issue.suggested_resolution}</p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleResolveIssue(issue.id, 'accept_suggestion')}
                                disabled={resolvingIssue === issue.id}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                data-testid={`accept-suggestion-${issue.id}-btn`}
                              >
                                {resolvingIssue === issue.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Accept Suggestion
                              </button>
                              <button
                                onClick={() => handleResolveIssue(issue.id, 'custom_edit')}
                                disabled={resolvingIssue === issue.id}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                data-testid={`custom-edit-${issue.id}-btn`}
                              >
                                <Edit3 className="w-4 h-4" />
                                Custom Edit
                              </button>
                              <button
                                onClick={() => handleResolveIssue(issue.id, 'ignore')}
                                disabled={resolvingIssue === issue.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 text-sm rounded-lg transition-colors"
                                data-testid={`ignore-issue-${issue.id}-btn`}
                              >
                                <XCircle className="w-4 h-4" />
                                Ignore
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
              <ColoredBorder color="green" />
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-lg font-semibold text-white mb-2">
                No Consistency Issues Found
              </h4>
              <p className="text-sm text-gray-400">
                {characterName} appears to be consistently portrayed across all analyzed content.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!report && !analyzeConsistency.isPending && (
        <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
          <ColoredBorder color="blue" />
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-white mb-2">
            Character Consistency Checker
          </h4>
          <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
            Analyze {characterName}'s portrayal across beats, scenes, and traits to detect inconsistencies in personality, motivations, speech patterns, and behavior.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={!selectedProject}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            data-testid="start-analysis-btn"
          >
            <Sparkles className="w-4 h-4" />
            Start Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterConsistencyPanel;

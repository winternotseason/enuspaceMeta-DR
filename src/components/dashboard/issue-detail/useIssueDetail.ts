import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGithubIssueTimeline,
  useAddReaction,
  useUpdateIssueComment,
  useDeleteIssueComment,
  useUpdateIssue,
} from '@/hooks/useGithub';

export function useIssueDetail(issue: any) {
  const queryClient = useQueryClient();
  const [activeReactionId, setActiveReactionId] = useState<number | 'issue' | null>(null);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState('');

  const currentUserLogin = localStorage.getItem('github_user')
    ? JSON.parse(localStorage.getItem('github_user') as string).login
    : '';

  const {
    data: timeline = [],
    isLoading: timelineLoading,
    refetch: timelineRefetch,
  } = useGithubIssueTimeline(issue.number);

  const addReactionMutation = useAddReaction(issue.number);
  const updateCommentMutation = useUpdateIssueComment(issue.number);
  const deleteCommentMutation = useDeleteIssueComment(issue.number);
  const updateIssueMutation = useUpdateIssue(issue.number);

  const [isEditingIssue, setIsEditingIssue] = useState(false);
  const [editingIssueBody, setEditingIssueBody] = useState(issue.body || '');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(issue.title || '');

  const startEditing = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editingCommentBody.trim()) return;
    await updateCommentMutation.mutateAsync({
      commentId: editingCommentId,
      body: editingCommentBody,
    });
    setEditingCommentId(null);
    timelineRefetch();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteCommentMutation.mutateAsync(commentId);
      timelineRefetch();
    }
  };

  const handleUpdateIssue = async () => {
    if (!editingIssueBody.trim()) return;

    // Update local cache optimistically
    queryClient.setQueryData(['github-issues'], (old: any) => {
      if (!old) return old;
      return old.map((iss: any) => {
        if (String(iss.number) === String(issue.number)) {
          return { ...iss, body: editingIssueBody };
        }
        return iss;
      });
    });

    try {
      await updateIssueMutation.mutateAsync(editingIssueBody);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }

    setIsEditingIssue(false);
  };

  const handleUpdateTitle = async () => {
    if (!editingTitle.trim()) return;

    // Update local cache optimistically
    queryClient.setQueryData(['github-issues'], (old: any) => {
      if (!old) return old;
      return old.map((iss: any) => {
        if (String(iss.number) === String(issue.number)) {
          return { ...iss, title: editingTitle };
        }
        return iss;
      });
    });

    try {
      await updateIssueMutation.mutateAsync({ title: editingTitle });
      timelineRefetch();
    } catch {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }

    setIsEditingTitle(false);
  };

  const handleAddReaction = async (
    commentId: number | undefined,
    content: string,
    currentCount: number
  ) => {
    setActiveReactionId(null);
    const newDelta = currentCount > 0 ? -1 : 1;

    // Optimistically update the react-query cache directly
    if (commentId) {
      queryClient.setQueryData(['github-issue-timeline', Number(issue.number)], (old: any) => {
        if (!old) return old;
        return old.map((ev: any) => {
          if (String(ev.id) === String(commentId)) {
            const rx = ev.reactions || {};
            return {
              ...ev,
              reactions: {
                ...rx,
                [content]: Math.max(0, (rx[content] || 0) + newDelta),
                total_count: Math.max(0, (rx.total_count || 0) + newDelta),
              },
            };
          }
          return ev;
        });
      });
    } else {
      queryClient.setQueryData(['github-issues'], (old: any) => {
        if (!old) return old;
        return old.map((iss: any) => {
          if (String(iss.number) === String(issue.number)) {
            const rx = iss.reactions || {};
            return {
              ...iss,
              reactions: {
                ...rx,
                [content]: Math.max(0, (rx[content] || 0) + newDelta),
                total_count: Math.max(0, (rx.total_count || 0) + newDelta),
              },
            };
          }
          return iss;
        });
      });
    }

    try {
      await addReactionMutation.mutateAsync({ commentId, content });
    } catch {
      queryClient.invalidateQueries({
        queryKey: ['github-issue-timeline', Number(issue.number)],
      });
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  };

  return {
    activeReactionId,
    setActiveReactionId,
    editingCommentId,
    setEditingCommentId,
    editingCommentBody,
    setEditingCommentBody,
    currentUserLogin,
    timeline,
    timelineLoading,
    timelineRefetch,
    isEditingIssue,
    setIsEditingIssue,
    editingIssueBody,
    setEditingIssueBody,
    isEditingTitle,
    setIsEditingTitle,
    editingTitle,
    setEditingTitle,
    startEditing,
    handleUpdateComment,
    handleDeleteComment,
    handleUpdateIssue,
    handleUpdateTitle,
    handleAddReaction,
    updateCommentPending: updateCommentMutation.isPending,
    updateIssuePending: updateIssueMutation.isPending,
  };
}

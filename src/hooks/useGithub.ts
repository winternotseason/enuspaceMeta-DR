import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getHeaders = (): HeadersInit => {
  const userToken = localStorage.getItem('github_token');

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }

  return headers;
};

const getOrgName = () => import.meta.env.VITE_GITHUB_ORG || 'vercel';

export const useGithubIssues = () => {
  return useQuery({
    queryKey: ['github-issues'],
    queryFn: async () => {
      const orgName = getOrgName();
      const res = await fetch(
        `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues?state=all&per_page=100`,
        { 
          headers: getHeaders(),
          cache: 'no-store' 
        }
      );
      if (!res.ok) throw new Error('Error fetching issues');
      const data = await res.json();
console.log(
  "HAS ",
  data
);
     
      return (data || []) as any[];
    }
  });
};

export const useGithubLabels = () => {
  return useQuery({
    queryKey: ['github-labels'],
    queryFn: async () => {
      const orgName = getOrgName();
      const res = await fetch(
        `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/labels`,
        { headers: getHeaders() }
      );
      if (!res.ok) throw new Error('Error fetching labels');
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      
      // We process open issue counts with another step to keep logic clean,
      // but to save requests, we can query them separately or here. Let's do it right here 
      // as `LabelsList` expects them enriched.
      const enrichedLabels = await Promise.all(
        data.map(async (label: any) => {
          const encodedLabel = encodeURIComponent(label.name);
          try {
            const countRes = await fetch(
              `https://api.github.com/search/issues?q=repo:${orgName}/enuspaceMeta-issues+type:issue+state:open+label:"${encodedLabel}"&per_page=1`,
              { 
                headers: getHeaders(),
                cache: 'no-store'
              }
            );
            const searchData = await countRes.json();
            return {
              ...label,
              open_issues: searchData.total_count || 0
            };
          } catch (err) {
            return { ...label, open_issues: 0 };
          }
        })
      );

      return enrichedLabels;
    }
  });
};

export const useGithubMembers = () => {
  return useQuery({
    queryKey: ['github-members'],
    queryFn: async () => {
      const orgName = getOrgName();
      const res = await fetch(
        `https://api.github.com/orgs/${orgName}/members`,
        { headers: getHeaders() }
      );
      if (!res.ok) throw new Error('Error fetching members');
      const data = await res.json();
      return (Array.isArray(data) ? data : []) as any[];
    }
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, body, labels }: { title: string, body: string, labels: string[] }) => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title,
          body,
          labels
        }),
        cache: 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to create issue');
      }

      return res.json();
    },
    onSuccess:  async (newIssue) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['github-issues'] });
      }, 2000);
      return newIssue;
}
  });
};

export const useGithubIssueTimeline = (issueNumber: number | null) => {
  return useQuery({
    queryKey: ['github-issue-timeline', issueNumber],
    queryFn: async () => {
      if (!issueNumber) return [];
      const orgName = getOrgName();
      const res = await fetch(
        `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}/timeline?per_page=100`,
        { 
          headers: getHeaders(), // Needs true to use user's token for commenting
          cache: 'no-store'
        }
      );
      if (!res.ok) throw new Error('Error fetching timeline');
      return await res.json() as any[];
    },
    enabled: !!issueNumber,
  });
};

export const useAddIssueComment = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ body }),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to add comment');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', issueNumber] });
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  });
};

export const useAddReaction = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId?: number, content: string }) => {
      const orgName = getOrgName();
      const reactionsUrl = commentId 
        ? `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/comments/${commentId}/reactions`
        : `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}/reactions`;
        
      // Fetch current reactions to check for a toggle
      const existingRes = await fetch(reactionsUrl, { headers: getHeaders() });
      let existingReactions: any[] = [];
      if (existingRes.ok) {
        existingReactions = await existingRes.json();
      }

      const currentUserStr = localStorage.getItem('github_user');
      let currentUsername = null;
      if (currentUserStr) {
        try { currentUsername = JSON.parse(currentUserStr).login; } catch(e) {}
      }

      let existingReactionId = null;
      if (currentUsername && Array.isArray(existingReactions)) {
        const matchingReaction = existingReactions.find(
          (r: any) => r.content === content && r.user?.login === currentUsername
        );
        if (matchingReaction) existingReactionId = matchingReaction.id;
      }

      // If already reacted, delete it (Toggle OFF)
      if (existingReactionId) {
        const deleteUrl = commentId 
          ? `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/comments/${commentId}/reactions/${existingReactionId}`
          : `https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}/reactions/${existingReactionId}`;
        
        const res = await fetch(deleteUrl, { method: 'DELETE', headers: getHeaders() });
        if (!res.ok) throw new Error('Failed to delete reaction');
        return { isDeleted: true, content, commentId };
      }

      // Otherwise, add it (Toggle ON)
      const res = await fetch(reactionsUrl, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error('Failed to add reaction');
      }

      return { isDeleted: false, ...(await res.json()), commentId };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', Number(issueNumber)] });
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  });
};

export const useUpdateIssueComment = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, body }: { commentId: number, body: string }) => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/comments/${commentId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ body }),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to update comment');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', Number(issueNumber)] });
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  });
};

export const useDeleteIssueComment = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/comments/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to delete comment');
      }
      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', Number(issueNumber)] });
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  });
};

export const useUpdateIssue = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to update issue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  });
};

export const useUpdateIssueLabels = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labels: string[]) => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ labels }),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to update issue labels');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', Number(issueNumber)] });
    }
  });
};

export const useCloseIssue = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ state: 'closed' }),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to close issue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', Number(issueNumber)] });
    }
  });
};

export const useReopenIssue = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ state: 'open', state_reason: 'reopened' }),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to reopen issue');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
      queryClient.invalidateQueries({ queryKey: ['github-issue-timeline', Number(issueNumber)] });
    }
  });
};

export const useDeleteIssue = (issueNumber: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const orgName = getOrgName();
      const res = await fetch(`https://api.github.com/repos/${orgName}/enuspaceMeta-issues/issues/${issueNumber}`, {
        method: 'DELETE',
        headers: getHeaders(),
        cache : 'no-cache'
      });

      if (!res.ok) {
        throw new Error('Failed to delete issue');
      }
      return issueNumber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  });
};

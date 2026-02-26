import { useState } from 'react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CircleDot } from 'lucide-react';
import { MarkdownEditor } from '../MarkdownEditor';
import { useAddIssueComment, useCloseIssue, useReopenIssue } from '@/hooks/useGithub';

export function IssueCommentBox({ 
  issue, 
  onCommentAdded 
}: { 
  issue: any, 
  onCommentAdded: () => void 
}) {
  const [commentBody, setCommentBody] = useState('');
  const addCommentMutation = useAddIssueComment(issue.number);

  const handleAddComment = async () => {
    if (!commentBody.trim()) return;
    await addCommentMutation.mutateAsync(commentBody);
    setCommentBody('');
    onCommentAdded();
  };

  const closeIssueMutation = useCloseIssue(issue.number);
  const reopenIssueMutation = useReopenIssue(issue.number);

  const handleCloseIssue = async () => {
    if (confirm('Are you sure you want to close this issue?')) {
      await closeIssueMutation.mutateAsync();
      onCommentAdded();
    }
  };

  const handleReopenIssue = async () => {
    if (confirm('Are you sure you want to reopen this issue?')) {
      await reopenIssueMutation.mutateAsync();
      onCommentAdded();
    }
  };

  const userString = localStorage.getItem('github_user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <div className="flex mt-8" id="comment-box">
      <Avatar className="w-10 h-10 mr-4">
        <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} />
      </Avatar>
      <div className="flex-1 w-full flex flex-col items-end">
        
        <div className="w-full relative rounded-md focus-within:ring-2 focus-within:ring-[#0969da] focus-within:border-transparent transition-all bg-white overflow-hidden">
          <MarkdownEditor 
            id={`comment-${issue.number}`}
            value={commentBody}
            onChange={setCommentBody}
            placeholder="Leave a comment"
          />
        </div>

        <div className="flex items-center justify-end mt-3 space-x-2">
          {issue.state === 'closed' ? (
            <Button 
              onClick={reopenIssueMutation.isPending ? undefined : handleReopenIssue}
              className={`flex items-center border border-[#d0d7de] rounded-md overflow-hidden bg-[#f6f8fa] hover:bg-[#f3f4f6] transition-colors cursor-pointer mr-1 ${reopenIssueMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center  py-1.25 font-semibold text-[14px] text-[#24292f]">
                <CircleDot className="w-4 h-4 text-[#1a7f37] mr-1.5" />
                {reopenIssueMutation.isPending ? "Reopening..." : "Reopen issue"}
              </div>
            </Button>
          ) : (
            <Button 
              onClick={closeIssueMutation.isPending ? undefined : handleCloseIssue}
              className={`flex items-center border border-[#d0d7de] rounded-md overflow-hidden bg-[#f6f8fa] hover:bg-[#f3f4f6] transition-colors cursor-pointer mr-1 ${closeIssueMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center py-1.25 font-semibold text-[14px] text-[#24292f]">
                <CheckCircle2 className="w-4 h-4 text-[#8250df] mr-1.5" />
                {closeIssueMutation.isPending ? "Closing..." : "Close issue"}
              </div>
            </Button>
          )}

          <Button 
            disabled={!commentBody.trim() || addCommentMutation.isPending} 
            onClick={handleAddComment}
            className="cursor-pointer bg-[#1f883d] hover:bg-[#1a7f37] text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-4"
          >
            {addCommentMutation.isPending ? 'Commenting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </div>
  );
}

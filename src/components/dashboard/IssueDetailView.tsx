import { useIssueDetail } from './issue-detail/useIssueDetail';
import { MoreHorizontal, Pencil, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MappingName } from '@/constant/Mapping';
import { REACTION_EMOJIS } from '@/constant/ReactionEmojis';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MarkdownEditor } from './MarkdownEditor';
import { renderMarkdown, getTimeAgo } from '@/utils/helpers';
import { IssueHeader } from './issue-detail/IssueHeader';
import { IssueSidebar } from './issue-detail/IssueSidebar';
import { IssueCommentBox } from './issue-detail/IssueCommentBox';
import { IssueTimelineEvent } from './issue-detail/IssueTimelineEvent';

export function IssueDetailView({ issue, onBack }: { issue: any, onBack: () => void}) {
  const {
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
    startEditing,
    handleUpdateComment,
    handleDeleteComment,
    handleUpdateIssue,
    handleAddReaction,
    isEditingTitle,
    setIsEditingTitle,
    editingTitle,
    setEditingTitle,
    handleUpdateTitle,
    updateCommentPending,
    updateIssuePending,
  } = useIssueDetail(issue);

  const renderReactions = (targetId: number | 'issue', targetReactions: any, commentIdForApi?: number) => {
    return (
      <div className="px-4 pb-3 flex flex-wrap items-center gap-2 relative bg-white rounded-b-md">
        <div className="relative">
          <button 
            onClick={() => setActiveReactionId(activeReactionId === targetId ? null : targetId)}
            className="w-7 h-7 rounded-full bg-[#f6f8fa] border border-[#d0d7de] flex items-center justify-center text-[#57606a] hover:bg-[#0969da] hover:text-white hover:border-[#0969da] transition-all"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          
          {activeReactionId === targetId && (
            <div className="absolute z-50 bottom-full left-0 mb-1.5 p-1 bg-white border border-[#d0d7de] rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.1)] flex gap-1 items-center">
              {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => (
                <button 
                  key={key} 
                  onClick={() => handleAddReaction(commentIdForApi, key, targetReactions?.[key] || 0)}
                  className="hover:bg-[#f3f4f6] hover:scale-110 p-1.5 rounded-full transition-all text-[16px] leading-none w-8 h-8 flex items-center justify-center"
                  title={key}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {targetReactions && targetReactions.total_count > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(REACTION_EMOJIS).map(([key, emoji]) => {
              if (targetReactions[key] > 0) {
                return (
                  <button 
                    key={key} 
                    onClick={() => handleAddReaction(commentIdForApi, key, targetReactions?.[key] || 0)}
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-transparent bg-[#ddf4ff] hover:bg-[#b6e3ff] text-[12px] text-[#0969da] font-medium transition-colors cursor-pointer"
                  >
                    <span className="text-[14px] leading-none">{emoji}</span>
                    <span>{targetReactions[key]}</span>
                  </button>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="w-full mx-auto font-sans pb-20">
      <IssueHeader 
        issue={issue} 
        onBack={onBack} 
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        handleUpdateTitle={handleUpdateTitle}
        updateIssuePending={updateIssuePending}
      />

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Main Content & Timeline) */}
        <div className="flex-1 min-w-0">
          
          {/* Main Issue Comment */}
          <div className="flex pb-8 relative z-10 group">
            <div className="relative mr-4 flex flex-col items-center flex-none w-10">
              <Avatar className="w-10 h-10 border border-[#d0d7de] z-10 bg-white">
                <AvatarImage src={issue.user.avatar_url} />
                <AvatarFallback>{issue.user.login[0]}</AvatarFallback>
              </Avatar>
              {timeline.length > 0 && <div className="absolute top-10 -bottom-8 w-0.5 bg-[#d0d7de] z-0 left-4.75"></div>}
            </div>
            <div className="flex-1 w-full border border-[#d0d7de] rounded-md overflow-hidden bg-white  ">
              <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-2 flex items-center justify-between text-[#57606a] text-[13px]">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-[#24292f]">{MappingName[issue.user.login as keyof typeof MappingName] || issue.user.login}</span>
                  <span>{getTimeAgo(issue.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {issue.user.login === currentUserLogin && !isEditingIssue && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                         <button className="text-[#57606a] hover:text-[#24292f] p-1 ml-1"><MoreHorizontal className="w-4 h-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => {
                          setEditingIssueBody(issue.body || '');
                          setIsEditingIssue(true);
                        }}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
              
              {isEditingIssue ? (
                <div className="w-full relative focus-within:ring-2 focus-within:ring-[#0969da] focus-within:border-[#0969da] transition-all bg-white overflow-hidden rounded-b-md">
                   <MarkdownEditor 
                      id={`edit-issue-${issue.number}`}
                      value={editingIssueBody}
                      onChange={setEditingIssueBody}
                      placeholder="Leave a description"

                      noBorder={true}
                    />
                  <div className="flex items-center justify-end p-3 bg-white space-x-2 border-t border-[#d0d7de]">
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditingIssue(false)}
                      className="text-[#24292f] hover:bg-[#f3f4f6] bg-[#f6f8fa] font-semibold px-4 h-8 border-[#d0d7de]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      disabled={!editingIssueBody.trim() || updateIssuePending} 
                      onClick={handleUpdateIssue}
                      className="bg-[#1f883d] hover:bg-[#1a7f37] text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-4 h-8"
                    >
                      {updateIssuePending ? 'Updating...' : 'Update issue'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="p-4 text-[14px] text-[#24292f] prose prose-sm max-w-none wrap-break-word custom-markdown overflow-x-auto bg-white"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(issue.body) }}
                  />
                  {renderReactions('issue', issue.reactions, undefined)}
                </>
              )}
            </div>
          </div>

          {/* Timeline Events & Comments */}
          <div className="relative">
            {timelineLoading ? (
               <div className="ml-15 py-4 text-[#57606a] animate-pulse text-[13px]">Loading timeline...</div>
            ) : (
              timeline.map((event: any, idx: number) => (
                <IssueTimelineEvent 
                  key={event.id || idx}
                  event={event} 
                  index={idx} 
                  isLast={idx === timeline.length - 1}
                  currentUserLogin={currentUserLogin}
                  editingCommentId={editingCommentId}
                  setEditingCommentId={setEditingCommentId}
                  startEditing={startEditing}
                  handleDeleteComment={handleDeleteComment}
                  editingCommentBody={editingCommentBody}
                  setEditingCommentBody={setEditingCommentBody}
                  handleUpdateComment={handleUpdateComment}
                  updateCommentPending={updateCommentPending}
                  renderReactions={renderReactions} 
                />
              ))
            )}
          </div>

          <div className="my-4 border-t border-[#d0d7de]"></div>

          <IssueCommentBox issue={issue} onCommentAdded={timelineRefetch} />
        </div>

        <IssueSidebar issue={issue} />

      </div>

    </div>
  );
}

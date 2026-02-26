import { ArrowLeft, CheckCircle2, CircleDot, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MappingName } from '@/constant/Mapping';
import { getTimeAgo } from '@/utils/helpers';

export function IssueHeader({ 
  issue, 
  onBack,
  onNewIssue,
  isEditingTitle,
  setIsEditingTitle,
  editingTitle,
  setEditingTitle,
  handleUpdateTitle,
  updateIssuePending
}: { 
  issue: any, 
  onBack: () => void,
  onNewIssue?: () => void,
  isEditingTitle?: boolean,
  setIsEditingTitle?: (b: boolean) => void,
  editingTitle?: string,
  setEditingTitle?: (t: string) => void,
  handleUpdateTitle?: () => void,
  updateIssuePending?: boolean
}) {
  return (
    <div className="flex flex-col space-y-4 mb-6 border-b border-[#d0d7de] pb-6">
      <div className="flex items-start justify-between mt-2">
        <div className="flex items-start flex-1 min-w-0 mr-4">
          <button 
            onClick={onBack}
            className="mr-3 mt-1.5 p-1.5 flex items-center justify-center rounded-md hover:bg-[#f3f4f6] text-[#57606a] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {isEditingTitle && setIsEditingTitle && setEditingTitle && handleUpdateTitle ? (
            <div className="flex flex-col flex-1 gap-2">
              <input 
                type="text" 
                value={editingTitle} 
                onChange={e => setEditingTitle(e.target.value)} 
                className="w-full text-[32px] font-normal leading-tight text-[#24292f] border border-[#d0d7de] rounded-md px-3 py-1 focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da] outline-none"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleUpdateTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleUpdateTitle} 
                  disabled={updateIssuePending || !editingTitle?.trim() || editingTitle === issue.title}
                  className="h-8 bg-[#1f883d] hover:bg-[#1a7f37] text-white"
                >
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditingTitle(issue.title);
                  }}
                  className="h-8 text-[#24292f]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <h1 className="text-[32px] font-normal leading-tight text-[#24292f] break-all mt-1">
              {issue.title} <span className="text-[#8c959f] font-light">#{issue.number}</span>
            </h1>
          )}
        </div>
        
        <div className="flex items-center space-x-2 shrink-0 self-start mt-2">
          {!isEditingTitle && setIsEditingTitle && (
            <Button variant="outline" className="h-8 border-[#d0d7de] text-[#24292f] font-medium text-[14px]" onClick={() => {
              setIsEditingTitle(true);
              setEditingTitle?.(issue.title);
            }}>
              Edit
            </Button>
          )}
          <a href={issue.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-center ml-2 p-1.5 rounded-md hover:bg-[#f3f4f6] text-[#57606a] transition-colors">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-[14px] text-[#57606a]">
        {issue.state === 'open' ? (
          <div className="flex items-center bg-[#1f883d] text-white px-3 py-1.5 rounded-full font-semibold  text-[13px]">
            <CircleDot className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5}/> Open
          </div>
        ) : (
          <div className="flex items-center bg-[#8250df] text-white px-3 py-1.5 rounded-full font-semibold  text-[13px]">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2.5}/> Closed
          </div>
        )}
        
        <span className="font-semibold text-[#57606a] ml-2">
          {MappingName[issue.user.login as keyof typeof MappingName] || issue.user.login}
        </span>
        <span>
          opened this issue {getTimeAgo(issue.created_at)} · {issue.comments} comments
        </span>
      </div>
    </div>
  );
}

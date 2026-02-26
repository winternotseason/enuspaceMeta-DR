
import { 
  Search, Tag, CheckCircle2, CircleDot, ChevronDown, MessageSquare, Check, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MappingName } from '@/constant/Mapping';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

interface IssuesListViewProps {
  loading: boolean;
  isError: boolean;
  
  allIssuesLength: number;
  openIssuesCount: number;
  closedIssuesCount: number;

  filterState: 'all' | 'open' | 'closed';
  setFilterState: (val: 'all' | 'open' | 'closed') => void;

  filterAuthor: string;
  setFilterAuthor: (val: string) => void;
  uniqueAuthors: string[];

  filterLabel: string;
  setFilterLabel: (val: string) => void;
  uniqueLabels: string[];

  filterType: string;
  setFilterType: (val: string) => void;
  uniqueTypes: string[];

  sortOrder: 'newest' | 'oldest' | 'comments' | 'recently_updated';
  setSortOrder: (val: any) => void;
  sortLabelsMap: Record<string, string>;

  paginatedIssues: any[];
  
  currentPage: number;
  setCurrentPage: (val: number) => void;
  totalPages: number;

  setCurrentView: (view: 'issues' | 'labels') => void;
  onOpenNewIssueModal: () => void;
  onSelectIssue: (issue: any) => void;
}

export function IssuesListView({
  loading,
  isError,
  allIssuesLength,
  openIssuesCount,
  closedIssuesCount,
  filterState,
  setFilterState,
  filterAuthor,
  setFilterAuthor,
  uniqueAuthors,
  filterLabel,
  setFilterLabel,
  uniqueLabels,
  filterType,
  setFilterType,
  uniqueTypes,
  sortOrder,
  setSortOrder,
  sortLabelsMap,
  paginatedIssues,
  currentPage,
  setCurrentPage,
  totalPages,
  setCurrentView,
  onOpenNewIssueModal,
  onSelectIssue
}: IssuesListViewProps) {

  const getTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="w-full mx-auto font-sans text-left pb-10">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-4 space-y-3 xl:space-y-0 xl:space-x-4">
        {/* Search Bar - unabled feature Yet */}
        <div className="flex flex-1 w-full relative cursor-not-allowed">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[14px]">
            <span className="text-gray-300">is:issue</span>
            {filterState !== 'all' && <span className="text-gray-300 ml-1">state:{filterState}</span>}
          </div>
          <input 
            type="text"
            disabled
            className="block cursor-not-allowed w-full h-8 pl-30 pr-10 border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0969da] focus:border-transparent text-[14px] outline-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center cursor-not-allowed">
            <button className="p-1 text-gray-300  mr-1 cursor-not-allowed" onClick={() => setFilterState('all')}>
              <svg viewBox="0 0 16 16" width="16" height="16" className="fill-current w-4 h-4"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.78-2.22a.751.751 0 0 1 1.042.018L8 6.94l.68-.68a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l.68.68a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-.68.68a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8l-.68-.68a.75.75 0 0 1 .02-1.06Z"></path></svg>
            </button>
            <div className="w-px h-5 bg-[#d0d7de] mx-1"></div>
            <button className="px-2 h-full flex items-center justify-center text-gray-300 cursor-not-allowed">
              <Search className="w-4 h-4" />
            </button>
          </div>  
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full xl:w-auto shrink-0">
          <Button 
            variant="ghost" 
            className="cursor-pointer rounded-md border border-[#d0d7de] px-3.5 py-1.5 h-8 text-[14px] font-medium text-[#24292f] hover:bg-[#f3f4f6]"
            onClick={() => setCurrentView('labels')}
          >
            <Tag className="w-4 h-4 mr-1.5 text-[#57606a]" />
            Labels
          </Button>
          <Button 
            className="cursor-pointer bg-[#1f883d] hover:bg-[#1a7f37] text-white px-3.5 py-1.5 h-8 text-[14px] font-medium rounded-md  border border-[rgba(27,31,36,0.15)]"
            onClick={onOpenNewIssueModal}
          >
            New issue
          </Button>
        </div>
      </div>

      {/* List Container */}
      <div className="border border-[#d0d7de] rounded-md flex flex-col mt-4 overflow-hidden bg-white">
        
        {/* List Header */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3 flex items-center justify-between text-[14px] text-[#57606a]">
          <div className="flex items-center space-x-4">
            <div 
              className={`flex items-center cursor-pointer transition-colors ${filterState === 'all' ? 'text-[#24292f] font-semibold' : 'hover:text-[#24292f]'}`}
              onClick={() => setFilterState('all')}
            >
              <Layers className="w-4 h-4 mr-1.5" strokeWidth={2} />
              {allIssuesLength} All
            </div>
            <div 
              className={`flex items-center cursor-pointer transition-colors ${filterState === 'open' ? 'text-[#24292f] font-semibold' : 'hover:text-[#24292f]'}`}
              onClick={() => setFilterState('open')}
            >
              <CircleDot className="w-4 h-4 mr-1.5" strokeWidth={2} />
              {openIssuesCount} Open
            </div>
            <div 
              className={`flex items-center cursor-pointer transition-colors ${filterState === 'closed' ? 'text-[#24292f] font-semibold' : 'hover:text-[#24292f]'}`}
              onClick={() => setFilterState('closed')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" strokeWidth={2} />
              {closedIssuesCount} Closed
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-7 text-[14px]">
            
            {/* Author Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer hover:text-[#24292f]">
                  Author <ChevronDown className="w-4 h-4 ml-1 opacity-70" strokeWidth={2} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-50">
                <DropdownMenuItem onClick={() => setFilterAuthor('all')} className="cursor-pointer">
                  {filterAuthor === 'all' && <Check className="w-4 h-4 mr-2" />}
                  <span className={filterAuthor === 'all' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>All authors</span>
                </DropdownMenuItem>
                {uniqueAuthors.map(author => (
                  <DropdownMenuItem key={author} onClick={() => setFilterAuthor(author)} className="cursor-pointer">
                    {filterAuthor === author && <Check className="w-4 h-4 mr-2" />}
                    <span className={filterAuthor === author ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>{MappingName[author as string as keyof typeof MappingName] || author}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Labels Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer hover:text-[#24292f]">
                  Labels <ChevronDown className="w-4 h-4 ml-1 opacity-70" strokeWidth={2} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-50 max-h-75 overflow-y-auto">
                <DropdownMenuItem onClick={() => setFilterLabel('all')} className="cursor-pointer">
                  {filterLabel === 'all' && <Check className="w-4 h-4 mr-2" />}
                  <span className={filterLabel === 'all' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>All labels</span>
                </DropdownMenuItem>
                {uniqueLabels.map(label => (
                  <DropdownMenuItem key={label} onClick={() => setFilterLabel(label as string)} className="cursor-pointer">
                    {filterLabel === label && <Check className="w-4 h-4 mr-2" />}
                    <span className={filterLabel === label ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>{label as string}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Types Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer hover:text-[#24292f]">
                  Types <ChevronDown className="w-4 h-4 ml-1 opacity-70" strokeWidth={2} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45">
                <DropdownMenuItem onClick={() => setFilterType('all')} className="cursor-pointer">
                  {filterType === 'all' && <Check className="w-4 h-4 mr-2" />}
                  <span className={filterType === 'all' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>All types</span>
                </DropdownMenuItem>
                {uniqueTypes.map(type => (
                  <DropdownMenuItem key={type} onClick={() => setFilterType(type)} className="cursor-pointer">
                    {filterType === type && <Check className="w-4 h-4 mr-2" />}
                    <span className={filterType === type ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>{type}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer hover:text-[#24292f]">
                  <svg className="w-4 h-4 mr-1 opacity-70" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.22 8.72a.75.75 0 0 0 1.06-1.06l-1.5-1.5a.75.75 0 0 0-1.06 0l-1.5 1.5a.75.75 0 0 0 1.06 1.06l.22-.22v3.25a.75.75 0 0 0 1.5 0V8.5l.22.22Zm6.06-1.44a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.06 0l1.5-1.5a.75.75 0 1 0-1.06-1.06l-.22.22V4.25a.75.75 0 0 0-1.5 0v3.25l-.22-.22Z"></path>
                  </svg>
                  <span className="font-semibold text-[#24292f]">{sortLabelsMap[sortOrder]}</span> <ChevronDown className="w-4 h-4 ml-1 opacity-70" strokeWidth={2} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45">
                <DropdownMenuItem onClick={() => setSortOrder('newest')} className="cursor-pointer">
                  {sortOrder === 'newest' && <Check className="w-4 h-4 mr-2" />}
                  <span className={sortOrder === 'newest' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>Newest</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('oldest')} className="cursor-pointer">
                  {sortOrder === 'oldest' && <Check className="w-4 h-4 mr-2" />}
                  <span className={sortOrder === 'oldest' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>Oldest</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('comments')} className="cursor-pointer">
                  {sortOrder === 'comments' && <Check className="w-4 h-4 mr-2" />}
                  <span className={sortOrder === 'comments' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>Most commented</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('recently_updated')} className="cursor-pointer">
                  {sortOrder === 'recently_updated' && <Check className="w-4 h-4 mr-2" />}
                  <span className={sortOrder === 'recently_updated' ? "font-semibold ml-auto flex-1 text-left" : "ml-6 text-left"}>Recently updated</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

        {/* List Body */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-[#57606a]">
            <span className="text-[14px] font-medium animate-pulse">이슈 데이터를 불러오는 중입니다...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-24 text-[#d83b4b]">
            <span className="text-[14px] font-medium">이슈 데이터를 불러오는데 실패했습니다.</span>
          </div>
        ) : paginatedIssues.length === 0 ? (
          <div className="flex justify-center items-center py-24 text-[#57606a]">
            <span className="text-[14px] font-medium">조회된 이슈가 없습니다.</span>
          </div>
        ) : (
          paginatedIssues.map((issue) => {
            const commentsCount = issue.comments || 0;

            return (
              <div key={issue.id} onClick={() => onSelectIssue(issue)}className="flex items-start px-4 py-2 hover:bg-[#f6f8fa] border-b border-[#d0d7de] last:border-b-0 group">
                
                {/* Status Icon */}
                <div className="pt-1 mr-2 shrink-0">
                  {issue.state === 'closed' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#8250df]" />
                  ) : (
                    <CircleDot className="w-4 h-4 text-[#1a7f37]" strokeWidth={2.5} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-4 mt-0.5">
                  {/* Title & Labels */}
                  <div className="flex items-center flex-wrap gap-1.5 mb-1">
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); onSelectIssue(issue); }} 
                      className="text-[16px] font-semibold text-[#24292f] hover:text-[#0969da] wrap-break-word leading-tight"
                    >
                      {issue.title}
                    </a>
                    {issue.labels && issue.labels.map((l: any) => (
                      <span 
                        key={l.id} 
                        className="px-2.5 py-px text-[12px] font-semibold rounded-full border border-[rgba(27,31,36,0.15)] shadow-none shrink-0"
                        style={{ backgroundColor: `#${l.color}`, color: '#fff' }} 
                      >
                        {l.name}
                      </span>
                    ))}
                  </div>
                  
                  {/* Subtitle / Metadata */}
                  <div className="text-[12px] text-[#57606a] mt-1.5">
                    #{issue.number} · {MappingName[issue.user.login as keyof typeof MappingName] || issue.user.login} {issue.state === 'closed' ? 'was closed' : 'opened'} {getTimeAgo(issue.state === 'closed' && issue.closed_at ? issue.closed_at : issue.created_at)}
                  </div>
                </div>

                {/* Right Side Accessories (Comments) */}
                <div className="w-12.5 shrink-0 pt-1 flex justify-end">
                  {commentsCount > 0 && (
                    <div className="flex items-center text-[#57606a] hover:text-[#0969da] cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-1.5 opacity-80" />
                      <span className="text-[12px] font-semibold">{commentsCount}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 mb-2 space-x-1.5 font-sans">
          <button 
            className={`px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors flex items-center ${currentPage === 1 ? 'text-[#8e959f] cursor-not-allowed' : 'text-[#0969da] hover:bg-[#f3f4f6]'}`}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={2} />
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`w-8 h-8 flex items-center justify-center text-[14px] rounded-md transition-colors ${currentPage === page ? 'bg-[#0969da] text-white font-semibold' : 'text-[#24292f] hover:bg-[#f3f4f6]'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className={`px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors flex items-center ${currentPage === totalPages ? 'text-[#8e959f] cursor-not-allowed' : 'text-[#0969da] hover:bg-[#f3f4f6]'}`}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" strokeWidth={2} />
          </button>
        </div>
      )}

    </div>
  );
}

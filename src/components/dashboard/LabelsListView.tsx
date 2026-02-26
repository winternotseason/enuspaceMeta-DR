
import { Search, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dispatch, SetStateAction } from 'react';

interface LabelsListViewProps {
  loading: boolean;
  isError: boolean;
  paginatedLabels: any[];
  filteredLabelsLength: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortOrder: "alphabetico" | "alphabetico_reverse" | "issues_count_desc" | "issues_count_asc"
  setSortOrder: Dispatch<SetStateAction<"alphabetico" | "alphabetico_reverse" | "issues_count_desc" | "issues_count_asc">>
  currentPage: number;
  setCurrentPage: (val: number) => void;
  totalPages: number;
  onBackToIssues?: () => void;
}

export function LabelsListView({
  loading,
  isError,
  paginatedLabels,
  filteredLabelsLength,
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  currentPage,
  setCurrentPage,
  totalPages,
  onBackToIssues
}: LabelsListViewProps) {

  // Calculate text color based on background hex
  const getContrastYIQ = (hexcolor: string) => {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'text-[#24292f]' : 'text-white';
  };

  return (
    <div className="w-full mx-auto font-sans text-left pb-10">
      
      {/* Title & Back button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#24292f] text-[24px] font-semibold">Labels</h2>
        <button 
          onClick={onBackToIssues}
          className="text-[#0969da] hover:underline text-[14px] font-medium"
        >
          ← Back to Issues
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search all labels"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="block w-full h-8 pl-3 pr-10 border border-[#d0d7de] rounded-md bg-[#f6f8fa] focus:bg-white focus:ring-2 focus:ring-[#0969da] focus:border-transparent text-[14px] outline-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
             <Search className="w-4 h-4 text-[#57606a]" />
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="border border-[#d0d7de] rounded-md flex flex-col mt-4 overflow-hidden bg-white">
        
        {/* Header */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3 flex items-center justify-between text-[14px] text-[#57606a]">
          <div className="font-semibold text-[#24292f]">
            {filteredLabelsLength} labels
          </div>
          <div className="flex items-center space-x-4">
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer hover:text-[#24292f] select-none bg-white border border-[#d0d7de] px-3 py-1 rounded-md text-[13px] font-medium shadow-sm active:bg-[#f6f8fa] transition-colors">
                  <svg className="w-4 h-4 mr-1 opacity-70" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5.22 8.72a.75.75 0 0 0 1.06-1.06l-1.5-1.5a.75.75 0 0 0-1.06 0l-1.5 1.5a.75.75 0 0 0 1.06 1.06l.22-.22v3.25a.75.75 0 0 0 1.5 0V8.5l.22.22Zm6.06-1.44a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.06 0l1.5-1.5a.75.75 0 1 0-1.06-1.06l-.22.22V4.25a.75.75 0 0 0-1.5 0v3.25l-.22-.22Z"></path>
                  </svg>
                  Sort <ChevronDown className="w-4 h-4 ml-1 opacity-70" strokeWidth={2} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-50 text-[13px] font-sans rounded-md border-[#d0d7de] shadow-lg">
                <DropdownMenuLabel className="font-semibold text-[#24292f] text-[12px] px-3 py-2">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#d0d7de]" />
                
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder.includes('issues_count') ? sortOrder : 'alphabetico')} className="cursor-pointer px-3 py-1.5 focus:bg-[#f6f8fa]">
                  {sortOrder.includes('alphabetico') && <Check className="w-4 h-4 mr-2 absolute left-2" />}
                  <span className="pl-6 text-[#24292f]">Name</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder.includes('alphabetico') ? 'issues_count_desc' : sortOrder)} className="cursor-pointer px-3 py-1.5 focus:bg-[#f6f8fa]">
                  {sortOrder.includes('issues_count') && <Check className="w-4 h-4 mr-2 absolute left-2" />}
                  <span className="pl-6 text-[#24292f]">Total issue count</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[#d0d7de]" />
                <DropdownMenuLabel className="font-semibold text-[#24292f] text-[12px] px-3 py-2">Order</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#d0d7de]" />
                
                <DropdownMenuItem 
                  onClick={() => {
                    if (sortOrder.includes('issues_count')) setSortOrder('issues_count_asc');
                    else setSortOrder('alphabetico');
                  }} 
                  className="cursor-pointer px-3 py-1.5 focus:bg-[#f6f8fa]"
                >
                  {(sortOrder === 'alphabetico' || sortOrder === 'issues_count_asc') && <Check className="w-4 h-4 mr-2 absolute left-2" />}
                  <div className="pl-6 flex items-center text-[#24292f]">
                    <svg className="w-4 h-4 mr-2 opacity-70" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M3.47 7.78a.75.75 0 0 1 0-1.06l4-4a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1-1.06 1.06L8 4.31 4.53 7.78a.75.75 0 0 1-1.06 0zM8 13.5a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-1.5 0v7.5A.75.75 0 0 0 8 13.5z"></path>
                    </svg>
                    Ascending
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => {
                    if (sortOrder.includes('issues_count')) setSortOrder('issues_count_desc');
                    else setSortOrder('alphabetico_reverse');
                  }} 
                  className="cursor-pointer px-3 py-1.5 focus:bg-[#f6f8fa]"
                >
                  {(sortOrder === 'alphabetico_reverse' || sortOrder === 'issues_count_desc') && <Check className="w-4 h-4 mr-2 absolute left-2" />}
                  <div className="pl-6 flex items-center text-[#24292f]">
                     <svg className="w-4 h-4 mr-2 opacity-70" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M13.03 8.22a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 1 1 1.06-1.06L8 11.69 11.97 7.72a.75.75 0 0 1 1.06 0zM8 2.5a.75.75 0 0 0-.75.75v7.5a.75.75 0 0 0 1.5 0v-7.5A.75.75 0 0 0 8 2.5z"></path>
                     </svg>
                    Descending
                  </div>
                </DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-[#57606a]">
            <span className="text-[14px] font-medium animate-pulse">라벨 데이터를 불러오는 중입니다...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-24 text-[#d83b4b]">
            <span className="text-[14px] font-medium">라벨 데이터를 불러오는데 실패했습니다.</span>
          </div>
        ) : paginatedLabels.length === 0 ? (
          <div className="flex justify-center items-center py-24 text-[#57606a]">
            <span className="text-[14px] font-medium">검색된 라벨이 없습니다.</span>
          </div>
        ) : (
          paginatedLabels.map((label: any) => (
             <div key={label.id} className="flex flex-col sm:flex-row items-start sm:items-center px-4 py-3 border-b border-[#d0d7de] last:border-b-0 hover:bg-[#f6f8fa] group">
               
               <div className="w-[25%] sm:w-62.5 shrink-0 mb-2 sm:mb-0">
                  <span 
                    className={`px-3 py-1 font-semibold rounded-full border border-[rgba(27,31,36,0.15)] shadow-none flex items-center justify-center w-fit text-[12px] truncate ${getContrastYIQ(label.color)}`}
                    style={{ backgroundColor: `#${label.color}` }}
                    title={label.name}
                  >
                    {label.name}
                  </span>
               </div>
               
               <div className="flex-1 min-w-0 pr-4  text-[#57606a]">
                  {label.description}
               </div>

               <div className="w-20 text-[12px] shrink-0 flex items-center justify-end relative group/tooltip">
                  {label.open_issues > 0 && (
                    <>
                      <div className="flex items-center text-[#57606a] hover:text-[#0969da] cursor-pointer">
                        <svg className="w-4 h-4 mr-1 opacity-70" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
                          <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
                        </svg>
                        {label.open_issues}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute font-sans bottom-full mb-2 right-0 hidden group-hover/tooltip:flex whitespace-nowrap bg-[#24292f] text-white text-[11px] font-semibold px-2 py-1 rounded shadow-md z-10 transition-opacity">
                        {label.open_issues} open issue{label.open_issues > 1 ? 's' : ''}
                        <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-[#24292f]"></div>
                      </div>
                    </>
                  )}
               </div>
             </div>
          ))
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

import { useState } from 'react';
import { Settings, Search, Check } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGithubLabels, useUpdateIssueLabels } from '@/hooks/useGithub';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

export function IssueSidebar({ issue }: { issue: any }) {
  const { data: allLabels = [] } = useGithubLabels();
  const updateLabelsMutation = useUpdateIssueLabels(issue.number);
  
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [snapshotLabelNames, setSnapshotLabelNames] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Extract currently applied label names
  const currentLabelNames = issue.labels?.map((l: any) => l.name) || [];

  const handleToggleLabel = async (labelName: string) => {
    let newLabels = [...currentLabelNames];
    if (newLabels.includes(labelName)) {
      newLabels = newLabels.filter(l => l !== labelName);
    } else {
      newLabels.push(labelName);
    }

    // Optimistic update
    queryClient.setQueryData(['github-issues'], (old: any) => {
      if (!old) return old;
      return old.map((iss: any) => {
        if (String(iss.number) === String(issue.number)) {
          return {
            ...iss,
            labels: newLabels.map(name => allLabels.find((l: any) => l.name === name)).filter(Boolean)
          };
        }
        return iss;
      });
    });

    try {
      await updateLabelsMutation.mutateAsync(newLabels);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['github-issues'] });
    }
  };

  // Filter labels by search input
  const filteredLabels = allLabels.filter((l: any) => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    (l.description && l.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Split into selected vs unselected for the UI based on SNAPSHOT so they don't jump around
  const selectedLabelsToRender = filteredLabels.filter((l: any) => snapshotLabelNames.includes(l.name));
  const unselectedLabelsToRender = filteredLabels.filter((l: any) => !snapshotLabelNames.includes(l.name));

  return (
    <div className="w-full lg:w-70 shrink-0 text-[12px] text-[#57606a]">
      <div className="border-b border-[#d0d7de] py-3 flex flex-col group">
        
        <DropdownMenu open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (open) {
            setSnapshotLabelNames(issue.labels?.map((l: any) => l.name) || []);
          } else {
            setSearch('');
          }
        }}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-between font-semibold text-[#57606a] hover:text-[#0969da] cursor-pointer">
              Labels <Settings className="w-4 h-4 opacity-70 group-hover:text-[#0969da]" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-0 border-[#d0d7de] shadow-lg rounded-md mt-1 overflow-hidden">
            
            {/* Header */}
            <div className="px-3 md:px-4 py-2 bg-white flex items-center border-b border-[#d0d7de]">
              <span className="font-semibold text-[#24292f] text-[13px]">Apply labels to this issue</span>
            </div>
            
            {/* Search Input */}
            <div className="px-3 py-2 bg-white border-b border-[#d0d7de]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#57606a] absolute left-2 top-1.5" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter labels"
                  className="w-full pl-8 pr-3 py-1 text-[13px] border border-[#d0d7de] rounded-md focus:border-[#0969da] focus:ring-[#0969da] focus:ring-1 outline-none transition-all placeholder:text-[#8c959f]"
                  autoFocus
                />
              </div>
            </div>

            {/* Scrollable list */}
            <div className="max-h-64 overflow-y-auto bg-white custom-scrollbar">
              
              {/* Selected Labels Section */}
              {selectedLabelsToRender.length > 0 && (
                <>
                  <div className="bg-[#f6f8fa] px-3 md:px-4 py-1.5 text-[12px] font-semibold border-b border-[#d0d7de] text-[#57606a]">
                    Selected labels
                  </div>
                  <div>
                    {selectedLabelsToRender.map((label: any) => (
                      <div 
                        key={label.id}
                        className="flex items-start px-3 py-2 border-b border-[#d0d7de] hover:bg-[#f3f4f6] cursor-pointer last:border-b-0"
                        onClick={() => handleToggleLabel(label.name)}
                      >
                        <div className={`mr-2 mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 rounded-lg border ${currentLabelNames.includes(label.name) ? 'bg-[#0969da] border-[#0969da]' : 'bg-white border-[#d0d7de]'}`}>
                           {currentLabelNames.includes(label.name) && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <div className="flex items-center">
                            <span 
                              className="w-3.5 h-3.5 rounded-full mr-2 shrink-0 border border-black/10 shadow-sm"
                              style={{ backgroundColor: `#${label.color}` }}
                            ></span>
                            <span className="text-[13px] font-semibold text-[#24292f] truncate">{label.name}</span>
                          </div>
                          {label.description && (
                            <span className="text-[12px] text-[#57606a] truncate mt-0.5">{label.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Suggestions Section */}
              {unselectedLabelsToRender.length > 0 && (
                <>
                  <div className="bg-[#f6f8fa] px-3 md:px-4 py-1.5 text-[12px] font-semibold border-b border-[#d0d7de] border-t-0 text-[#57606a]">
                    Suggestions
                  </div>
                  <div>
                    {unselectedLabelsToRender.map((label: any) => (
                      <div 
                        key={label.id}
                        className="flex items-start px-3 py-2 border-b border-[#d0d7de] hover:bg-[#f3f4f6] cursor-pointer last:border-b-0"
                        onClick={() => handleToggleLabel(label.name)}
                      >
                        <div className={`mr-2 mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 rounded-lg border ${currentLabelNames.includes(label.name) ? 'bg-[#0969da] border-[#0969da]' : 'bg-white border-[#d0d7de]'}`}>
                           {currentLabelNames.includes(label.name) && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <div className="flex items-center">
                            <span 
                              className="w-3.5 h-3.5 rounded-full mr-2 shrink-0 border border-black/10 shadow-sm"
                              style={{ backgroundColor: `#${label.color}` }}
                            ></span>
                            <span className="text-[13px] font-semibold text-[#24292f] truncate">{label.name}</span>
                          </div>
                          {label.description && (
                            <span className="text-[12px] text-[#57606a] truncate mt-0.5">{label.description}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Display currently selected labels in the sidebar outside the menu */}
        {issue.labels?.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {issue.labels.map((l: any) => (
              <span 
                key={l.id} 
                className="px-2 py-0.5 text-[12px] font-semibold rounded-full border border-gray-200/50 shrink-0 text-white"
                style={{ backgroundColor: `#${l.color}` }} 
              >
                {l.name}
              </span>
            ))}
          </div>
        ) : (
           <div className="mt-1">None yet</div>
        )}
      </div>
    </div>
  );
}

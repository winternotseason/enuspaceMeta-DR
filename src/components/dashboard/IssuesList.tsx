import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabelsList } from './LabelsList';
import { useGithubIssues } from '@/hooks/useGithub';
import { IssuesListView } from './IssuesListView';
import { NewIssueModal } from './NewIssueModal';

export function IssuesList() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'issues' | 'labels'>('issues');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data , isLoading: loading, isError} = useGithubIssues();
  const allIssues = data ?? [];
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20; // Temporarily reduced to 1 for demonstration

  // Filter States
  const [filterState, setFilterState] = useState<'all' | 'open' | 'closed'>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'comments' | 'recently_updated'>('newest');

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState, filterAuthor, filterLabel, filterType, sortOrder]);

  // Helper to extract a type indicator letter and color from labels
  const getTypeFromLabels = (labels: any[]) => {
    if (!labels) return { char: 'T', color: 'bg-[#82c695]', key: 'Task' }; 
    const labelsStr = labels.map((l: any) => l.name.toLowerCase()).join(' ');
    
    if (labelsStr.includes('bug') || labelsStr.includes('critical')) {
      return { char: 'B', color: 'bg-[#d83b4b]', key: 'Bug' }; 
    }
    if (labelsStr.includes('feature') || labelsStr.includes('enhancement')) {
      return { char: 'F', color: 'bg-[#6195f2]', key: 'Feature' }; 
    }
    if (labelsStr.includes('design')) {
      return { char: 'D', color: 'bg-[#e75494]', key: 'Design' };
    }
    return { char: 'T', color: 'bg-[#82c695]', key: 'Task' }; 
  };

 

  // Derive unique options for dropdowns
  const uniqueAuthors = Array.from(new Set(allIssues.map(i => i.user.login)));
  const uniqueLabels = Array.from(new Set(allIssues.flatMap(i => i.labels?.map((l: any) => l.name) || [])));
  const uniqueTypes = ['Bug', 'Feature', 'Design', 'Task'];
  
  // Calculate Open/Closed base counts (regardless of other filters except 'all')
  const openIssuesCount = allIssues.filter(i => i.state === 'open').length;
  const closedIssuesCount = allIssues.filter(i => i.state === 'closed').length;

  // Apply filters block
  let displayIssues = [...allIssues];

  if (filterState !== 'all') {
    displayIssues = displayIssues.filter(i => i.state === filterState);
  }
  if (filterAuthor !== 'all') {
    displayIssues = displayIssues.filter(i => i.user.login === filterAuthor);
  }
  if (filterLabel !== 'all') {
    displayIssues = displayIssues.filter(i => i.labels?.some((l: any) => l.name === filterLabel));
  }
  if (filterType !== 'all') {
    displayIssues = displayIssues.filter(i => getTypeFromLabels(i.labels).key === filterType);
  }

  // Apply sorting
  displayIssues.sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === 'comments') return (b.comments || 0) - (a.comments || 0);
    if (sortOrder === 'recently_updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return 0;
  });

  // Sort labels mapping helper
  const sortLabelsMap: Record<string, string> = {
    'newest': 'Newest',
    'oldest': 'Oldest',
    'comments': 'Most commented',
    'recently_updated': 'Recently updated'
  };

  const totalPages = Math.ceil(displayIssues.length / ITEMS_PER_PAGE);
  
  const paginatedIssues = displayIssues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (currentView === 'labels') {
    return <LabelsList onBackToIssues={() => setCurrentView('issues')} />;
  }

  return (
    <>
      <IssuesListView
        loading={loading}
        isError={isError}
        allIssuesLength={allIssues.length}
        openIssuesCount={openIssuesCount}
        closedIssuesCount={closedIssuesCount}
        filterState={filterState}
        setFilterState={setFilterState}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
        uniqueAuthors={uniqueAuthors}
        filterLabel={filterLabel}
        setFilterLabel={setFilterLabel}
        uniqueLabels={uniqueLabels}
        filterType={filterType}
        setFilterType={setFilterType}
        uniqueTypes={uniqueTypes}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortLabelsMap={sortLabelsMap}
        paginatedIssues={paginatedIssues}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        setCurrentView={setCurrentView}
        onOpenNewIssueModal={() => setIsModalOpen(true)}
        onSelectIssue={(issue) => navigate(`/issues/${issue.number}`, { state: { initialIssue: issue } })}
      />

      <NewIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        navigateIssuePage={(issue) => navigate(`/issues/${issue.number}`, { state: { initialIssue: issue } })}
      />
    </>
  );
}

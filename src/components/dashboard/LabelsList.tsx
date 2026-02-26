import { useState} from 'react';
import { useGithubLabels } from '@/hooks/useGithub';
import { LabelsListView } from './LabelsListView';

export function LabelsList({ onBackToIssues }: { onBackToIssues?: () => void }) {
  const { data: labels = [], isLoading: loading, isError } = useGithubLabels();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting
  const [sortOrder, setSortOrder] = useState<'alphabetico' | 'alphabetico_reverse' | 'issues_count_desc' | 'issues_count_asc'>('alphabetico');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;


  let filteredLabels = labels.filter(label => 
    label.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (label.description && label.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Apply sorting
  filteredLabels = filteredLabels.sort((a, b) => {
    switch (sortOrder) {
      case 'alphabetico':
        return a.name.localeCompare(b.name);
      case 'alphabetico_reverse':
        return b.name.localeCompare(a.name);
      case 'issues_count_desc':
        return (b.open_issues || 0) - (a.open_issues || 0);
      case 'issues_count_asc':
        return (a.open_issues || 0) - (b.open_issues || 0);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredLabels.length / ITEMS_PER_PAGE);
  const paginatedLabels = filteredLabels.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <LabelsListView
      loading={loading}
      isError={isError}
      paginatedLabels={paginatedLabels}
      filteredLabelsLength={filteredLabels.length}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalPages={totalPages}
      onBackToIssues={onBackToIssues}
    />
  );
}

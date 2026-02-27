import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useGithubIssues } from '@/hooks/useGithub';
import { IssueDetailView } from '../components/dashboard/IssueDetailView';
import { useEffect } from 'react';

export function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: allIssues, isLoading } = useGithubIssues();

  const issueId = Number(id);
  const initialIssue = location.state?.initialIssue;
  
  const apiIssue = allIssues?.find((i: any) => i.number === issueId);
  const issue = apiIssue || (initialIssue?.number === issueId ? initialIssue : null);

  // If data is loaded and issue isn't found, you might want to show a 404 or redirect
  useEffect(() => {
    if (!isLoading && !issue && allIssues) {
      // Optional: Handle missing issue (e.g., navigate to /issues)
    }
  }, [isLoading, issue, allIssues]);

  if (!issue && isLoading) {
    return <div className="p-8">Loading issue details...</div>;
  }

  if (!issue) {
    return <div className="p-8">Issue not found.</div>;
  }

  return (
    <IssueDetailView 
      issue={issue} 
      onBack={() => {
        navigate('/issues');
        // @ts-ignore
        if (typeof window !== 'undefined' && window.__setSelectedIssueTitle) {
          // @ts-ignore
          window.__setSelectedIssueTitle(null);
        }
      }} 
    />
  );
}

import { useGithubMembers } from '@/hooks/useGithub';
import { MembersListView } from './MembersListView';

export function MembersList() {
  const { data: members = [], isLoading: loadingMembers, isError } = useGithubMembers();

  return (
    <MembersListView
      members={members}
      loadingMembers={loadingMembers}
      isError={isError}
    />
  );
}

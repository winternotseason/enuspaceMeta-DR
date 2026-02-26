
import { ChevronDown} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { MappingName } from '../../constant/Mapping';

interface GithubMember {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

interface MembersListViewProps {
  members: GithubMember[];
  loadingMembers: boolean;
  isError: boolean;
}

export function MembersListView({
  members,
  loadingMembers,
  isError
}: MembersListViewProps) {
  return (
    <div className="">
      <div className="border border-[#d0d7de] rounded-md bg-white  overflow-hidden">
        
        {/* Members Header */}
        <div className="bg-[#f6f8fa] border-b border-[#d0d7de] px-4 py-3 flex items-center justify-between text-[13px] font-semibold text-[#24292f]">
          <div className="flex items-center space-x-4">
            <span>Members</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-gray-200">
            <div className="flex items-center transition-colors">
              Two-factor authentication <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </div>
            <div className="flex items-center  transition-colors">
              Membership <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>

        {/* Members List */}
        {loadingMembers ? (
          <div className="flex justify-center items-center py-20 text-[#57606a]">
            <span className="text-[14px] font-semibold animate-pulse">Loading members...</span>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-20 text-[#d83b4b]">
            <span className="text-[14px] font-semibold">Error fetching members data.</span>
          </div>
        ) : members.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-[#57606a]">
            <span className="text-[14px] font-semibold">No members found.</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {members.map((member, index) => (
              <div key={member.id} className={`flex items-start md:items-center px-4 py-4 hover:bg-[#f6f8fa] transition-colors ${index !== members.length - 1 ? 'border-b border-[#d0d7de]' : ''}`}>
                
             
                
                {/* Avatar */}
                <div className="mr-4 shrink-0">
                  <Avatar className="h-12 w-12 rounded-full border border-[#d0d7de] shadow-sm">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="bg-[#f6f8fa] text-[#57606a] font-bold">{member.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* User Info */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex flex-col">
                    <p className="cursor-default text-[16px] font-semibold text-[#0969da] hover:underline truncate w-max">
                      {member.login}
                    </p>
                    <span className="text-[13px] text-black/40 truncate w-max">
                      {(MappingName as Record<string, string>)[member.login] || "-"}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

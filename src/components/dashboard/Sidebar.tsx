import { MappingName } from '@/constant/Mapping';
import { 
  Users,  LogOut,  MoreHorizontal,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useLocation, Link } from 'react-router-dom';

interface SidebarProps {
  onLogout?: () => void;
  user?: any;
}

export function Sidebar({ onLogout, user }: SidebarProps) {
  const location = useLocation();
  const mainNavItems = [
    { id: 'issues', label: '이슈', icon: CheckCircle, path: '/issues' },
    { id: 'members', label: '조직원', icon: Users, path: '/members' },
  ];

  const getIsActive = (path: string) => {
    return location.pathname.startsWith(path);
  };


  return (
    <aside className="w-75 bg-linear-to-br from-[#182353] via-[#16171a] to-[#16171a] text-[#8e959f] shrink-0 flex flex-col overflow-y-auto md:flex border-r border-[#1e1f23]">
      <div className="p-5 flex items-center space-x-3 mb-2 shrink-0">
        <img src="/icons/enu_logo.png" className='w-10 h-10'/>
        <span className="text-white font-medium text-lg tracking-wide">Discrepancy Report</span>
      </div>

      <div className="flex-1 overflow-y-auto mb-2 no-scrollbar">
        <nav className="space-y-1 px-3">
          {mainNavItems.map((item) => (
            <Link 
              key={item.id}
              to={item.path}
              className={`flex items-center px-3 py-4 rounded-lg transition-all duration-200 group ${
                getIsActive(item.path) 
                  ? 'bg-white/10 text-white font-medium shadow-sm' 
                  : 'text-[#8e959f] hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6 mr-3.5" strokeWidth={getIsActive(item.path) ? 2.5 : 2} />
              <span className="text-base">{item.label}</span>
            </Link>
          ))}
        </nav>

      
      </div>
      
      {/* User Card & Menu */}
      <div className="mt-auto px-3 pb-6 shrink-0 border-t border-[#32343a] pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-3 py-6 rounded-lg hover:bg-white/20 text-left transition-all">
              <Avatar className="h-11 w-11 mr-3 rounded-full">
                <AvatarImage src={user?.avatar_url || "https://github.com/shadcn.png"} alt={user?.login || "User"} className="rounded-full" />
                <AvatarFallback className="rounded-full uppercase">{user?.login?.substring(0, 2) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 truncate text-white">
                <span className="text-base font-semibold leading-none mb-1">{user?.login || "User"}</span>
                <span className="text-sm text-[#8e959f] leading-none">{MappingName[user?.login as keyof typeof MappingName] || "User"}</span>
              </div>
              <MoreHorizontal className="h-4.5 w-4.5 text-[#8e959f]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-55 bg-[#16171a] border-[#32343a] text-white" align="start" side="right" sideOffset={10}>
            <DropdownMenuItem onClick={onLogout} className="text-red-400 focus:bg-red-400/20 focus:text-red-400 cursor-pointer transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

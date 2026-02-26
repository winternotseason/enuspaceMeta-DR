
interface HeaderProps {
  activeTab: string;
}

const tabNames: Record<string, string> = {
  issues: '이슈',
  members: '조직원',
};

export function Header({ activeTab }: HeaderProps) {
  const currentTitle = tabNames[activeTab] || '이슈';
  return (
    <header className="h-14 border-b border-[#e1e4e8] bg-white flex items-center justify-between px-4 shrink-0 w-full z-10">
      <div className="flex items-center space-x-3 ">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 ml-1">
            <span className="text-[16px] font-semibold text-[#24292f] whitespace-nowrap overflow-hidden text-ellipsis max-w-150 flex items-center">
             {currentTitle}
            </span>
          </div>
        </div>
      </div>

    </header>
  );
}

import  { useState} from 'react';
import { Sidebar } from './components/dashboard/Sidebar';
import { Header } from './components/dashboard/Header';
import { IssuesList } from './components/dashboard/IssuesList';
import { MembersList } from './components/dashboard/MembersList';

function Dashboard({ user, onLogout }: { user?: any, onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<'issues' | 'members'>('issues');


  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden text-[#586069] text-sm">
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); }} 
        onLogout={onLogout} 
        user={user}
      />


      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        <Header activeTab={activeTab}/>
        <div className="flex-1 overflow-y-auto ">
          <div className="max-w-350 px-8 py-8 mx-auto">
            {activeTab === 'issues' ? <IssuesList /> : <MembersList />}
          </div>
        </div>
      </main>
      
    </div>
  );
}

export default Dashboard;

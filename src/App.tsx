import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { MembersPage } from './pages/MembersPage';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('github_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    setUser(null);
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={(userData) => setUser(userData)} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<DashboardLayout user={user} onLogout={handleLogout} />}>
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/login" element={<Navigate to="/issues" replace />} />
        <Route path="/" element={<Navigate to="/issues" replace />} />
        <Route path="*" element={<Navigate to="/issues" replace />} />
      </Route>
    </Routes>
  );
}

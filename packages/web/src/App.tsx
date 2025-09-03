import { useEffect, useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Sidebar } from './components/SideBar';
import { ProjectView } from './components/Project/ProjectView';

const STORAGE_KEY = 'selectedProjectId';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (selectedId) localStorage.setItem(STORAGE_KEY, selectedId);
    else localStorage.removeItem(STORAGE_KEY);
  }, [selectedId]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app">
      <button 
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <Sidebar
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          setSidebarOpen(false); // Close sidebar on mobile after selection
        }}
        onCreated={(p) => {
          setSelectedId(p.id);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ProjectView projectId={selectedId} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

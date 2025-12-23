import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GrafanaSidebar } from '@/components/grafana/GrafanaSidebar';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { SearchModal } from '@/components/grafana/modals/SearchModal';

function BackendDashboardContent() {
  const { uid } = useParams();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/dashboards/uid/${uid}`);
        if (response.ok) {
          const data = await response.json();
          setDashboard(data);
        } else {
          setError('Dashboard not found');
        }
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      loadDashboard();
    }
  }, [uid]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <GrafanaSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <GrafanaSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.history.back()}
              className="grafana-btn grafana-btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <GrafanaSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-foreground">{dashboard?.dashboard?.title || 'Dashboard'}</h1>
          <div className="text-sm text-muted-foreground">
            UID: {dashboard?.dashboard?.uid}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Dashboard Details</h2>
            <div className="space-y-4">
              <div>
                <strong>Title:</strong> {dashboard?.dashboard?.title}
              </div>
              <div>
                <strong>UID:</strong> {dashboard?.dashboard?.uid}
              </div>
              <div>
                <strong>Version:</strong> {dashboard?.meta?.version}
              </div>
              <div>
                <strong>Created:</strong> {dashboard?.meta?.created ? new Date(dashboard.meta.created).toLocaleString() : 'Unknown'}
              </div>
              
              {dashboard?.dashboard?.panels && dashboard.dashboard.panels.length > 0 && (
                <div>
                  <strong>Panels:</strong>
                  <div className="mt-2 space-y-2">
                    {dashboard.dashboard.panels.map((panel: any, index: number) => (
                      <div key={index} className="bg-secondary p-3 rounded">
                        <div><strong>Title:</strong> {panel.title}</div>
                        <div><strong>Type:</strong> {panel.type}</div>
                        {panel.targets && panel.targets.length > 0 && (
                          <div>
                            <strong>Query:</strong> 
                            <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
                              {panel.targets[0].rawSql || JSON.stringify(panel.targets[0], null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <SearchModal />
    </div>
  );
}

export default function BackendDashboardViewer() {
  return (
    <DashboardProvider>
      <BackendDashboardContent />
    </DashboardProvider>
  );
}
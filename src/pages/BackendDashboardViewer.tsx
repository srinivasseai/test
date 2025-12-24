import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GrafanaSidebar } from '@/components/grafana/GrafanaSidebar';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { SearchModal } from '@/components/grafana/modals/SearchModal';
import { GrafanaHeader } from '@/components/grafana/GrafanaHeader';
import { PanelWrapper } from '@/components/grafana/PanelWrapper';
import { BarChartPanel } from '@/components/grafana/panels/BarChartPanel';
import { TablePanel } from '@/components/grafana/panels/TablePanel';

function BackendDashboardContent() {
  const { uid } = useParams();
  const { setPanels, setDashboardTitle } = useDashboard();
  const [dashboard, setDashboard] = useState<any>(null);
  const [panelData, setPanelData] = useState<Map<number, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/dashboards/uid/${uid}`);
        if (response.ok) {
          const data = await response.json();
          setDashboard(data);
          
          // Load dashboard data into context
          if (data.dashboard) {
            setDashboardTitle(data.dashboard.title || 'Dashboard');
            if (data.dashboard.panels) {
              setPanels(data.dashboard.panels);
              
              // Fetch data for each panel's query
              const newPanelData = new Map();
              for (const panel of data.dashboard.panels) {
                try {
                  if (panel.targets && panel.targets.length > 0) {
                    const queryResponse = await fetch('http://localhost:3001/api/query', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        queries: panel.targets.map((target: any) => ({
                          ...target,
                          datasource: panel.datasource?.uid || 'ds-1766569335163'
                        }))
                      })
                    });
                    
                    if (queryResponse.ok) {
                      const queryData = await queryResponse.json();
                      newPanelData.set(panel.id, queryData);
                    }
                  }
                } catch (err) {
                  console.error(`Failed to fetch data for panel ${panel.id}:`, err);
                }
              }
              setPanelData(newPanelData);
            }
          }
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
  }, [uid, setPanels, setDashboardTitle]);

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
        <GrafanaHeader />
        
        <main className="flex-1 overflow-auto p-6">
          {dashboard?.dashboard?.panels && dashboard.dashboard.panels.length > 0 ? (
            <div className="grid gap-4" style={{
              gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
              gridAutoRows: 'minmax(200px, auto)'
            }}>
              {dashboard.dashboard.panels.map((panel: any) => {
                const data = panelData.get(panel.id);
                const tableData = data?.data?.[0];
                
                return (
                  <div
                    key={panel.id}
                    style={{
                      gridColumn: `span ${panel.gridPos?.w || 12}`,
                      gridRow: `span ${panel.gridPos?.h || 8}`
                    }}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    <PanelWrapper panel={panel}>
                      {panel.type === 'barchart' && (
                        <BarChartPanel 
                          title={panel.title} 
                          data={tableData?.fields ? transformToChartData(tableData) : []}
                        />
                      )}
                      {panel.type === 'table' && (
                        <TablePanel 
                          title={panel.title}
                          columns={tableData?.fields?.map((field: any) => ({
                            key: field.name,
                            label: field.name,
                            align: 'left' as const
                          })) || []}
                          data={transformToTableData(tableData)}
                        />
                      )}
                      {!['barchart', 'table'].includes(panel.type) && (
                        <div className="p-4 text-sm text-muted-foreground">
                          Panel type "{panel.type}" not yet supported
                        </div>
                      )}
                    </PanelWrapper>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-lg text-muted-foreground">No panels in this dashboard</p>
              </div>
            </div>
          )}
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

// Helper function to transform DataFrame to chart data
function transformToChartData(dataFrame: any): any[] {
  if (!dataFrame?.fields || dataFrame.fields.length === 0) {
    return [];
  }

  // Find the first string field as the name/category
  const nameField = dataFrame.fields.find((f: any) => f.type === 'string') || dataFrame.fields[0];
  const valueFields = dataFrame.fields.filter((f: any) => f.type !== 'string' && f.type !== 'time');

  if (!nameField || valueFields.length === 0) {
    return [];
  }

  const nameIndex = dataFrame.fields.indexOf(nameField);
  const result = [];

  for (let i = 0; i < (nameField.values?.length || 0); i++) {
    const row: any = {
      name: nameField.values?.[i] || `Row ${i}`
    };

    for (const field of valueFields) {
      const fieldIndex = dataFrame.fields.indexOf(field);
      row[field.name] = field.values?.[i];
    }

    result.push(row);
  }

  return result;
}

// Helper function to transform DataFrame to table data
function transformToTableData(dataFrame: any): any[] {
  if (!dataFrame?.fields || dataFrame.fields.length === 0) {
    return [];
  }

  const result = [];
  const rowCount = dataFrame.fields[0]?.values?.length || 0;

  for (let i = 0; i < rowCount; i++) {
    const row: any = {};
    for (const field of dataFrame.fields) {
      row[field.name] = field.values?.[i];
    }
    result.push(row);
  }

  return result;
}
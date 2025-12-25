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
          console.log('Dashboard loaded:', data);
          setDashboard(data);
          
          // Load dashboard data into context
          if (data.dashboard) {
            console.log('Dashboard panels count:', data.dashboard.panels?.length || 0);
            setDashboardTitle(data.dashboard.title || 'Dashboard');
            if (data.dashboard.panels) {
              console.log('Setting panels:', data.dashboard.panels);
              setPanels(data.dashboard.panels);
              
              // Fetch data for each panel's query
              const newPanelData = new Map();
              for (const panel of data.dashboard.panels) {
                try {
                  if (panel.targets && panel.targets.length > 0) {
                    const datasourceId = panel.datasource?.uid || panel.datasource?.id || 'ds-1766569335163';
                    console.log(`Fetching data for panel ${panel.id} (${panel.title}), datasource: ${datasourceId}`);
                    
                    const queryResponse = await fetch('http://localhost:3001/api/query', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        queries: panel.targets.map((target: any) => ({
                          refId: target.refId || 'A',
                          datasource: datasourceId,
                          rawSql: target.rawSql || target.query || '',
                          format: target.format || 'table',
                          rawQuery: target.rawQuery !== undefined ? target.rawQuery : true
                        }))
                      })
                    });
                    
                    if (queryResponse.ok) {
                      const queryData = await queryResponse.json();
                      console.log(`Panel ${panel.id} data received:`, queryData);
                      newPanelData.set(panel.id, queryData);
                    } else {
                      const errorText = await queryResponse.text();
                      console.error(`Query failed for panel ${panel.id}:`, errorText);
                    }
                  } else {
                    console.warn(`Panel ${panel.id} has no targets`);
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
          {(() => {
            const panels = dashboard?.dashboard?.panels || [];
            console.log('Rendering dashboard with panels:', panels.length, 'panelData:', panelData.size);
            
            if (panels.length > 0) {
              return (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Dashboard has {panels.length} panel(s) | Data loaded for {panelData.size} panel(s)
                  </div>
                  <div className="grid gap-4" style={{
                    gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
                    gridAutoRows: 'minmax(200px, auto)'
                  }}>
                    {panels.map((panel: any) => {
                      const data = panelData.get(panel.id);
                      const tableData = data?.data?.[0];
                      const hasData = tableData?.fields && tableData.fields.length > 0;
                      
                      const chartData = hasData ? transformToChartData(tableData) : [];
                      const chartDataKeys = hasData && chartData.length > 0 
                        ? Object.keys(chartData[0]).filter(k => k !== 'name').map(key => ({
                            key,
                            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                            name: key
                          }))
                        : [{ key: "value", color: "hsl(199, 89%, 48%)", name: "Value" }];
                      
                      console.log(`=== Panel ${panel.id} (${panel.type}) ===`);
                      console.log('Has Data:', hasData);
                      console.log('Chart Data Length:', chartData.length);
                      console.log('Chart Data Keys:', chartDataKeys);
                      console.log('Chart Data Sample (first 2 rows):', JSON.stringify(chartData.slice(0, 2), null, 2));
                      console.log('Raw Data Keys:', data ? Object.keys(data) : []);
                      console.log('Table Data Keys:', tableData ? Object.keys(tableData) : []);
                      console.log('Table Data Fields:', JSON.stringify(
                        tableData?.fields?.map((f: any) => ({ 
                          name: f.name, 
                          type: f.type,
                          valuesLength: f.values?.length || 0
                        })) || [],
                        null,
                        2
                      ));
                      console.log(`=== END Panel ${panel.id} ===`);
                      
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
                              <>
                                {chartData.length === 0 && hasData && (
                                  <div className="p-4 text-sm text-yellow-600 bg-yellow-900/20 border border-yellow-800 rounded mb-2">
                                    ⚠️ Data received but could not transform to chart format. Check browser console for details.
                                  </div>
                                )}
                                {!hasData && (
                                  <div className="p-4 text-sm text-muted-foreground bg-muted/20 border border-border rounded mb-2">
                                    ⏳ Waiting for data... (Check console for query status)
                                  </div>
                                )}
                                <BarChartPanel 
                                  title={panel.title} 
                                  data={chartData}
                                  dataKeys={chartDataKeys}
                                  layout={panel.options?.orientation === "horizontal" ? "horizontal" : (panel.options?.layout || "vertical")}
                                />
                              </>
                            )}
                            {panel.type === 'table' && (
                              <TablePanel 
                                title={panel.title}
                                columns={hasData ? tableData.fields.map((field: any) => ({
                                  key: field.name,
                                  label: field.name,
                                  align: 'left' as const
                                })) : []}
                                data={hasData ? transformToTableData(tableData) : []}
                              />
                            )}
                            {!['barchart', 'table'].includes(panel.type) && (
                              <div className="p-4 text-sm text-muted-foreground">
                                Panel type "{panel.type}" not yet supported
                              </div>
                            )}
                            {!hasData && (panel.type === 'barchart' || panel.type === 'table') && (
                              <div className="p-4 text-sm text-yellow-600">
                                Loading data... (Panel ID: {panel.id})
                              </div>
                            )}
                          </PanelWrapper>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            } else {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-lg text-muted-foreground">No panels in this dashboard</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dashboard data: {dashboard ? 'Loaded' : 'Not loaded'} | 
                      Panels: {dashboard?.dashboard?.panels ? dashboard.dashboard.panels.length : 0}
                    </p>
                  </div>
                </div>
              );
            }
          })()}
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
  console.log('=== transformToChartData INPUT ===');
  console.log('Has DataFrame:', !!dataFrame);
  console.log('Fields Count:', dataFrame?.fields?.length || 0);
  console.log('Fields Details:', JSON.stringify(
    dataFrame?.fields?.map((f: any) => ({ 
      name: f.name, 
      type: f.type, 
      valuesLength: f.values?.length || 0,
      firstValue: f.values?.[0],
      sampleValues: f.values?.slice(0, 5)
    })) || [],
    null,
    2
  ));

  if (!dataFrame?.fields || dataFrame.fields.length === 0) {
    console.warn('transformToChartData: No fields in dataFrame');
    return [];
  }

  // Find the first string field as the name/category, or use first column if no string field
  const nameField = dataFrame.fields.find((f: any) => f.type === 'string' || f.type === 'text') 
    || dataFrame.fields[0];
  
  // Get numeric fields for values (exclude string, time, and the name field)
  const valueFields = dataFrame.fields.filter((f: any) => 
    f !== nameField && 
    f.type !== 'string' && 
    f.type !== 'text' && 
    f.type !== 'time' &&
    (f.type === 'number' || typeof f.values?.[0] === 'number')
  );

  console.log('=== transformToChartData PROCESSING ===');
  console.log('Name Field:', nameField?.name, 'Type:', nameField?.type);
  console.log('Value Fields Count:', valueFields.length);
  console.log('Value Fields:', JSON.stringify(
    valueFields.map((f: any) => ({ 
      name: f.name, 
      type: f.type,
      firstValue: f.values?.[0],
      sampleValues: f.values?.slice(0, 3)
    })),
    null,
    2
  ));

  if (!nameField) {
    console.warn('transformToChartData: No name field found');
    return [];
  }

  if (valueFields.length === 0) {
    console.warn('transformToChartData: No value fields found, using all non-name fields');
    // Fallback: use all fields except the name field
    const fallbackFields = dataFrame.fields.filter((f: any) => f !== nameField);
    if (fallbackFields.length === 0) {
      return [];
    }
    valueFields.push(...fallbackFields);
  }

  const result = [];
  const rowCount = nameField.values?.length || 0;

  // Check if we need to create unique names (if there are duplicates)
  const nameValues = nameField.values || [];
  const hasDuplicates = new Set(nameValues).size !== nameValues.length;
  
  // If duplicates exist, try to find a secondary field to make names unique
  let secondaryField = null;
  if (hasDuplicates) {
    // Look for another string field that could help make names unique
    secondaryField = dataFrame.fields.find((f: any) => 
      f !== nameField && 
      (f.type === 'string' || f.type === 'text') &&
      f.values?.length === nameValues.length
    );
    console.log('Found duplicate names, using secondary field:', secondaryField?.name);
  }

  for (let i = 0; i < rowCount; i++) {
    let rowName = nameField.values?.[i]?.toString() || `Row ${i + 1}`;
    
    // If duplicates exist and we have a secondary field, combine them
    if (hasDuplicates && secondaryField) {
      const secondaryValue = secondaryField.values?.[i]?.toString() || '';
      // Use a shorter version - take last part after dot or first 15 chars
      const shortSecondary = secondaryValue.includes('.') 
        ? secondaryValue.split('.').pop()?.substring(0, 15) || secondaryValue.substring(0, 15)
        : secondaryValue.substring(0, 15);
      rowName = `${rowName} - ${shortSecondary}`;
    } else if (hasDuplicates) {
      // If no secondary field, just add index to make unique
      rowName = `${rowName} #${i + 1}`;
    }
    
    const row: any = {
      name: rowName
    };

    for (const field of valueFields) {
      const value = field.values?.[i];
      // Convert to number if possible
      row[field.name] = typeof value === 'number' ? value : (parseFloat(value) || 0);
    }

    result.push(row);
  }

  console.log('=== transformToChartData OUTPUT ===');
  console.log('Result Count:', result.length);
  console.log('Result Keys (first row):', result.length > 0 ? Object.keys(result[0]) : []);
  console.log('First Row (full):', JSON.stringify(result[0] || null, null, 2));
  console.log('First 3 Rows:', JSON.stringify(result.slice(0, 3), null, 2));
  if (result.length > 3) {
    console.log('All Rows (first 10):', JSON.stringify(result.slice(0, 10), null, 2));
  }
  console.log('=== END transformToChartData ===');

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
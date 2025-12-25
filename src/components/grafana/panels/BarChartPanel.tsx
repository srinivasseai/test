import { MoreVertical, Maximize2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BarChartPanelProps {
  title: string;
  data?: any[];
  dataKeys?: { key: string; color: string; name: string }[];
  layout?: "horizontal" | "vertical";
  panelId?: string;
  csvBarData?: any[];
}

export function BarChartPanel({ title, data, dataKeys, layout = "vertical", csvBarData }: BarChartPanelProps) {
  const chartData = csvBarData || data || [];
  const chartKeys = dataKeys || [{ key: "value", color: "hsl(199, 89%, 48%)", name: "Value" }];
  
  // Debug logging
  console.log('=== BarChartPanel RENDER ===');
  console.log('Title:', title);
  console.log('Data Length:', chartData.length);
  console.log('Initial DataKeys:', JSON.stringify(chartKeys, null, 2));
  console.log('Layout:', layout);
  console.log('First Row:', JSON.stringify(chartData[0] || null, null, 2));
  console.log('First 3 Rows:', JSON.stringify(chartData.slice(0, 3), null, 2));
  
  // Show message if no data
  if (chartData.length === 0) {
    return (
      <div className="grafana-panel h-full flex flex-col">
        <div className="grafana-panel-header">
          <h3 className="grafana-panel-title">{title}</h3>
        </div>
        <div className="grafana-panel-content flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No data available</p>
            <p className="text-xs mt-2">Data: {chartData.length} rows</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if dataKeys match the data and fix if needed
  let finalChartKeys = chartKeys;
  if (chartData.length > 0 && chartKeys.length > 0) {
    const firstRow = chartData[0];
    const availableKeys = Object.keys(firstRow).filter(k => k !== 'name');
    const validKeys = chartKeys.filter(dk => dk.key in firstRow);
    const missingKeys = chartKeys.filter(dk => !(dk.key in firstRow));
    
    if (missingKeys.length > 0) {
      console.warn('BarChartPanel: Some dataKeys not found in data:', {
        missingKeys: missingKeys.map(k => k.key),
        availableKeys,
        firstRow
      });
      
      // If no valid keys, use all available numeric keys
      if (validKeys.length === 0 && availableKeys.length > 0) {
        console.log('BarChartPanel: Using all available keys as fallback');
        finalChartKeys = availableKeys.map((key, idx) => ({
          key,
          color: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
          name: key
        }));
      } else {
        // Use only valid keys
        finalChartKeys = validKeys;
      }
    }
  } else if (chartData.length > 0 && chartKeys.length === 0) {
    // No dataKeys provided, use all available keys
    const firstRow = chartData[0];
    const availableKeys = Object.keys(firstRow).filter(k => k !== 'name');
    if (availableKeys.length > 0) {
      console.log('BarChartPanel: No dataKeys provided, using all available keys');
      finalChartKeys = availableKeys.map((key, idx) => ({
        key,
        color: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        name: key
      }));
    }
  }
  
  console.log('Final Chart Keys:', JSON.stringify(finalChartKeys, null, 2));
  console.log('Final Keys Count:', finalChartKeys.length);
  console.log('Chart Data Sample:', JSON.stringify(chartData.slice(0, 3), null, 2));
  console.log('=== END BarChartPanel RENDER ===');
  
  // Debug: Check if bars will render
  if (finalChartKeys.length > 0 && chartData.length > 0) {
    const firstRow = chartData[0];
    const hasValidData = finalChartKeys.every(dk => dk.key in firstRow && firstRow[dk.key] != null);
    console.log('Will bars render?', {
      hasValidData,
      firstRowKeys: Object.keys(firstRow),
      dataKeys: finalChartKeys.map(k => k.key),
      firstRowValues: finalChartKeys.map(k => ({ key: k.key, value: firstRow[k.key] }))
    });
  }
  
  return (
    <div className="grafana-panel h-full flex flex-col">
      <div className="grafana-panel-header">
        <h3 className="grafana-panel-title">{title}</h3>
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground ml-2">
            ({chartData.length} rows, {finalChartKeys.length} series)
          </div>
        )}
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-secondary/50 text-muted-foreground">
            <Maximize2 size={14} />
          </button>
          <button className="p-1 rounded hover:bg-secondary/50 text-muted-foreground">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
      <div className="grafana-panel-content flex-1 min-h-0 p-2" style={{ minHeight: '300px' }}>
        {finalChartKeys.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p>No valid data keys found</p>
              <p className="text-xs mt-2">Available keys: {chartData.length > 0 ? Object.keys(chartData[0]).join(', ') : 'none'}</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <BarChart
              data={chartData}
              layout={layout}
              margin={{ top: 20, right: 20, left: 20, bottom: layout === "vertical" ? 60 : 20 }}
            >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="hsl(220, 18%, 25%)" 
              strokeOpacity={0.3}
            />
            {layout === "vertical" ? (
              <>
                <XAxis
                  dataKey="name"
                  stroke="hsl(210, 15%, 65%)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={chartData.length > 10 ? 100 : 60}
                  tick={{ fill: 'hsl(210, 15%, 65%)' }}
                  interval={0}
                />
                <YAxis
                  stroke="hsl(210, 15%, 65%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(210, 15%, 65%)' }}
                />
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  stroke="hsl(210, 15%, 65%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(210, 15%, 65%)' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="hsl(210, 15%, 65%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tick={{ fill: 'hsl(210, 15%, 65%)' }}
                />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 18%, 25%)",
                borderRadius: "8px",
                fontSize: "13px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
              }}
              cursor={{ fill: 'hsl(220, 18%, 18%)', fillOpacity: 0.3 }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: "13px", 
                paddingTop: "15px",
                color: "hsl(210, 15%, 65%)"
              }} 
            />
            {finalChartKeys.length > 0 ? (
              finalChartKeys.map((dk, index) => (
                <Bar
                  key={dk.key}
                  dataKey={dk.key}
                  name={dk.name}
                  fill={index === 0 ? "url(#barGradient)" : dk.color}
                  radius={layout === "vertical" ? [6, 6, 0, 0] : [0, 6, 6, 0]}
                  stroke={dk.color}
                  strokeWidth={1}
                />
              ))
            ) : (
              <Bar
                dataKey="value"
                name="Value"
                fill="url(#barGradient)"
                radius={layout === "vertical" ? [6, 6, 0, 0] : [0, 6, 6, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

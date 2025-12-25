# How to View Errors and Logs

## Browser Console (Recommended)

### Chrome/Edge:
1. Press **F12** or **Right-click** → **Inspect**
2. Click the **Console** tab
3. You'll see all logs, errors, and debug messages

### Firefox:
1. Press **F12** or **Right-click** → **Inspect Element**
2. Click the **Console** tab

### Safari:
1. Enable Developer Menu: Safari → Preferences → Advanced → Check "Show Develop menu"
2. Press **Cmd+Option+C** or Develop → Show JavaScript Console

## What to Look For

### Success Messages:
- ✅ "Dashboard loaded:"
- ✅ "Dashboard panels count: 2"
- ✅ "Fetching data for panel..."
- ✅ "Panel X data received:"
- ✅ "transformToChartData output:"

### Error Messages:
- ❌ "Failed to fetch data for panel..."
- ❌ "Query failed for panel..."
- ❌ "transformToChartData: No fields found"
- ❌ Red error messages

## Server Logs (Backend)

The server terminal shows:
- Dashboard loading: `✅ Loaded X dashboards from storage`
- API requests: `GET /api/dashboards/uid/...`
- Query execution errors

## Common Issues

### Barchart Not Showing:
1. Check console for "transformToChartData" logs
2. Look for "No value fields found" warnings
3. Verify data structure matches expected format

### No Data:
1. Check "Query failed" errors
2. Verify datasource connection
3. Check SQL query syntax

## Quick Debug Steps

1. **Open Browser Console** (F12)
2. **Refresh the dashboard page**
3. **Look for console messages** starting with:
   - "Dashboard loaded:"
   - "Panel X (barchart):"
   - "transformToChartData"
4. **Copy any red error messages** and share them


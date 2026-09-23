const fs = require('fs');
const path = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/interactions/ReportsPage.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useSelector to imports
content = content.replace(
  "import { useNavigate, useSearchParams } from 'react-router-dom';",
  "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport { useSelector } from 'react-redux';"
);

// 2. Add useSelector hook call
content = content.replace(
  "const activeTab = searchParams.get('tab') || 'interactions';",
  "const activeTab = searchParams.get('tab') || 'interactions';\n  const { dateRange } = useSelector((state) => state.date);"
);

// 3. Update queries
content = content.replace(
  "const { data: interactionsRes, isLoading, refetch } = useGetInteractionsQuery();",
  "const { data: interactionsRes, isLoading, refetch } = useGetInteractionsQuery({\n    start_date: dateRange?.startDate || undefined,\n    end_date: dateRange?.endDate || undefined,\n  });"
);

content = content.replace(
  "const { data: summaryRes } = useGetDailySummaryQuery();",
  "const { data: summaryRes } = useGetDailySummaryQuery({\n    start_date: dateRange?.startDate || undefined,\n    end_date: dateRange?.endDate || undefined,\n  });"
);

// 4. Update followups useMemo to filter by dateRange
const followupsOld = `
  const followups = useMemo(() => {
    if (Array.isArray(followupsRes?.data?.items)) return followupsRes.data.items;
    if (Array.isArray(followupsRes?.data?.leads)) return followupsRes.data.leads;
    if (Array.isArray(followupsRes?.data?.data)) return followupsRes.data.data;
    if (Array.isArray(followupsRes?.data)) return followupsRes.data;
    return [];
  }, [followupsRes]);
`;
const followupsNew = `
  const followups = useMemo(() => {
    let list = [];
    if (Array.isArray(followupsRes?.data?.items)) list = followupsRes.data.items;
    else if (Array.isArray(followupsRes?.data?.leads)) list = followupsRes.data.leads;
    else if (Array.isArray(followupsRes?.data?.data)) list = followupsRes.data.data;
    else if (Array.isArray(followupsRes?.data)) list = followupsRes.data;
    
    if (dateRange?.startDate && dateRange?.endDate) {
      list = list.filter(f => {
        if (!f.next_followup_date) return false;
        const d = new Date(f.next_followup_date).toISOString().slice(0,10);
        return d >= dateRange.startDate && d <= dateRange.endDate;
      });
    }
    return list;
  }, [followupsRes, dateRange]);
`;
content = content.replace(followupsOld.trim(), followupsNew.trim());

fs.writeFileSync(path, content);
console.log('Patched successfully');

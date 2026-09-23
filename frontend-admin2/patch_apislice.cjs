const fs = require('fs');
const file = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/core/api/apiSlice.js';
let content = fs.readFileSync(file, 'utf8');

const bulkAssignIdx = content.indexOf('bulkAssignLeads: builder.mutation({');

const bulkDeleteMethod = `bulkDeleteLeads: builder.mutation({
      query: (lead_ids) => ({
        url: '/admin/leads/bulk-delete',
        method: 'POST',
        body: { lead_ids },
      }),
      invalidatesTags: ['Leads'],
    }),
    `;

content = content.slice(0, bulkAssignIdx) + bulkDeleteMethod + content.slice(bulkAssignIdx);
fs.writeFileSync(file, content);

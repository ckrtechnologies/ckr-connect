const fs = require('fs');
const file = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/leads/api.js';
let content = fs.readFileSync(file, 'utf8');

const bulkAssignIdx = content.indexOf('bulkAssign:');

const bulkDeleteMethod = `bulkDelete: (lead_ids) =>
    apiClient.post('/admin/leads/bulk-delete', { lead_ids }),
  `;

content = content.slice(0, bulkAssignIdx) + bulkDeleteMethod + content.slice(bulkAssignIdx);
fs.writeFileSync(file, content);

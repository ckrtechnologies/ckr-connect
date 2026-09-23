const fs = require('fs');
const file = '/Users/chandanmallik/projects/ckrcrm/backend/src/domains/admin/staff/repository.js';
let content = fs.readFileSync(file, 'utf8');

// Patch create
content = content.replace(
  /employee_id, name, email, phone, designation, password_hash, role,\s*sales_target, force_password_reset, status, is_active\s*\) VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, true, 'active', true\)/g,
  "employee_id, name, email, phone, designation, password_hash, role, sales_target, date_of_joining, force_password_reset, status, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'active', true)"
);

content = content.replace(
  /data\.role \|\| 'bdm',\s*data\.target_amount \|\| data\.sales_target \|\| 0\s*\]\);/g,
  "data.role || 'bdm',\n      data.target_amount || data.sales_target || 0,\n      data.date_of_joining || null\n    ]);"
);

// Patch update
content = content.replace(
  /if \(data\.role !== undefined\) {/g,
  "if (data.date_of_joining !== undefined) {\n      fields.push(`date_of_joining = $${idx++}`);\n      values.push(data.date_of_joining);\n    }\n    if (data.role !== undefined) {"
);

fs.writeFileSync(file, content);
console.log("Patched repository.js");

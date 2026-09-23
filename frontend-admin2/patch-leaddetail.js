import fs from 'fs';

const filePath = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/leads/LeadDetailPage.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Import MultiSelectDropdown
if (!code.includes('MultiSelectDropdown')) {
  code = code.replace(
    "import { toast } from '../../core/components/Toast.jsx';",
    "import { toast } from '../../core/components/Toast.jsx';\nimport MultiSelectDropdown from '../../core/components/MultiSelectDropdown.jsx';"
  );
}

// 2. Replace native multiple select
const oldSelect = `<select
                          className="form-field-select"
                          multiple
                          size={4}
                          value={formData.tag_ids || []}
                          onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions, option => option.value);
                            handleFieldChange('tag_ids', values);
                          }}
                        >
                          {(tags || []).map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>`;

const newSelect = `<MultiSelectDropdown 
                          options={(tags || []).map(t => ({ label: t.name, value: t.id }))}
                          value={formData.tag_ids || []}
                          onChange={(values) => handleFieldChange('tag_ids', values)}
                          placeholder="Select tags..."
                        />`;

if (code.includes(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
  fs.writeFileSync(filePath, code);
  console.log("Updated LeadDetailPage");
} else {
  console.log("oldSelect not found");
}


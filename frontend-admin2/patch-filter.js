import fs from 'fs';

const filePath = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/leads/components/LeadFilterPanel.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Import MultiSelectDropdown
if (!code.includes('MultiSelectDropdown')) {
  code = code.replace(
    "import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';",
    "import { useBootstrap } from '../../../core/context/BootstrapContext.jsx';\nimport MultiSelectDropdown from '../../../core/components/MultiSelectDropdown.jsx';"
  );
}

// 2. Replace native multiple select
const oldSelect = `<select
              className="form-field-select"
              multiple
              size={5}
              value={localFilters.tag_ids || []}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                handleChange('tag_ids', values);
              }}
            >
              {(tags || []).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <small style={{ color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              Hold Ctrl/Cmd to select multiple
            </small>`;

const newSelect = `<MultiSelectDropdown 
              options={(tags || []).map(t => ({ label: t.name, value: t.id }))}
              value={localFilters.tag_ids || []}
              onChange={(values) => handleChange('tag_ids', values)}
              placeholder="Select tags to filter..."
            />`;

if (code.includes(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
  fs.writeFileSync(filePath, code);
  console.log("Updated LeadFilterPanel");
} else {
  console.log("oldSelect not found in FilterPanel");
}


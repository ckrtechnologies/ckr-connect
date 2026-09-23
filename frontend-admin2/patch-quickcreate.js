import fs from 'fs';

const filePath = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/leads/components/QuickCreateDrawer.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update initial state
code = code.replace(
  "tag_id: '',",
  "tag_ids: [],"
);

// 2. Update useEffect for defaults
code = code.replace(
  "if (tags && tags.length > 0 && !formData.tag_id) {\n      setFormData((prev) => ({ ...prev, tag_id: tags[0].id }));\n    }",
  "if (tags && tags.length > 0 && (!formData.tag_ids || formData.tag_ids.length === 0)) {\n      setFormData((prev) => ({ ...prev, tag_ids: [tags[0].id] }));\n    }"
);

// 3. Update payload
code = code.replace(
  "tag_id: formData.tag_id || undefined,",
  "tag_ids: formData.tag_ids && formData.tag_ids.length > 0 ? formData.tag_ids : undefined,"
);

// 4. Update form reset
code = code.replace(
  "tag_id: tags[0]?.id || '',",
  "tag_ids: tags[0]?.id ? [tags[0].id] : [],"
);

// 5. Update HTML select to be multiple
const oldSelect = `<select
                className="form-field-select"
                id="tag_id"
                value={formData.tag_id}
                onChange={handleChange}
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} ({tag.type})
                  </option>
                ))}
              </select>`;

const newSelect = `<select
                className="form-field-select"
                id="tag_ids"
                multiple
                size={4}
                value={formData.tag_ids || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, tag_ids: values }));
                }}
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} ({tag.type})
                  </option>
                ))}
              </select>
              <small style={{ color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                Hold Ctrl/Cmd to select multiple
              </small>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync(filePath, code);

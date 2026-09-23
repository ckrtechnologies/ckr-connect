const fs = require('fs');
const file = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/leads/LeadsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
const importRegex = /(import BulkAssignModal from '.\/components\/BulkAssignModal.jsx';)/;
const importReplacement = `$1
import BulkTagModal from './components/BulkTagModal.jsx';`;
content = content.replace(importRegex, importReplacement);

// Add state
const stateRegex = /(const \[isBulkAssignOpen, setIsBulkAssignOpen\] = useState\(false\);)/;
const stateReplacement = `$1
  const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);`;
content = content.replace(stateRegex, stateReplacement);

// Add Export Leads button
const exportRegex = /(<button\s+className="icon-btn-utility"\s+title="Bulk Import CSV"\s+onClick=\{\(\) => setIsImportOpen\(true\)\}\s+>\s+<svg[^>]*>[\s\S]*?<\/svg>\s+Import\s+<\/button>)/;
const exportReplacement = `$1
            <button
              className="icon-btn-utility"
              title="Export Leads to CSV"
              onClick={handleExportCsv}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
              </svg>
              Export
            </button>`;
content = content.replace(exportRegex, exportReplacement);

// Add Manage Tags button in selection bar
const tagBtnRegex = /(<button\s+className="fluent-btn fluent-btn-secondary"\s+onClick=\{\(\) => setIsBulkAssignOpen\(true\)\}\s+>\s+<span style=\{\{ fontSize: '12px' \}\}>👤<\/span> Assign \(\{selectedIds.size\}\)\s+<\/button>)/;
const tagBtnReplacement = `$1
              <button
                className="fluent-btn fluent-btn-secondary"
                onClick={() => setIsBulkTagOpen(true)}
              >
                <span style={{ fontSize: '12px' }}>🏷</span> Manage Tags ({selectedIds.size})
              </button>`;
content = content.replace(tagBtnRegex, tagBtnReplacement);

// Add BulkTagModal render
const renderRegex = /(<BulkAssignModal[\s\S]*?\/>\s+\)})/;
const renderReplacement = `$1

      {/* Bulk Tag Modal */}
      {isBulkTagOpen && (
        <BulkTagModal
          isOpen={isBulkTagOpen}
          selectedLeadIds={Array.from(selectedIds)}
          onClose={() => setIsBulkTagOpen(false)}
          onSuccess={() => {
            setSelectedIds(new Set());
            refetch();
          }}
        />
      )}`;
content = content.replace(renderRegex, renderReplacement);

fs.writeFileSync(file, content);

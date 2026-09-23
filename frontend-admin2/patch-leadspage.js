import fs from 'fs';

const filePath = '/Users/chandanmallik/projects/ckrcrm/frontend-admin2/src/modules/leads/LeadsPage.jsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add state variable
code = code.replace(
  "const [userMenuOpen, setUserMenuOpen] = useState(false);",
  "const [userMenuOpen, setUserMenuOpen] = useState(false);\n  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);"
);

// 2. Add tagIdsFilter state
code = code.replace(
  "const [searchQuery, setSearchQuery] = useState(initialSearch);",
  "const [searchQuery, setSearchQuery] = useState(initialSearch);\n  const [tagIdsFilter, setTagIdsFilter] = useState([]);"
);

// 3. Include tag_ids in the query
code = code.replace(
  "status: statusFilter === 'all' ? '' : statusFilter,",
  "status: statusFilter === 'all' ? '' : statusFilter,\n      tags: tagIdsFilter,"
);

// 4. Replace simple stage filter with advanced filters button
const filterHtml = `            <div className="filter-group">
              <button 
                className="fluent-btn-command" 
                onClick={() => setIsFilterPanelOpen(true)}
              >
                <span style={{ marginRight: '6px' }}>⚙️</span>
                Advanced Filters
              </button>
            </div>`;

code = code.replace(/<div className="filter-group">[\s\S]*?<\/div>[\s\S]*?<\/div>/, filterHtml);

// 5. Add filter panel at the end
const panelHtml = `
      <LeadFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={{ search: searchQuery, status: statusFilter, tag_ids: tagIdsFilter, assigned_to: bdmFilter }}
        setFilters={(f) => {
          setSearchQuery(f.search || '');
          setStatusFilter(f.status || '');
          setBdmFilter(f.assigned_to || '');
          setTagIdsFilter(f.tag_ids || []);
        }}
        onApply={() => {
          setPage(1);
          refetchLeads();
        }}
      />
    </div>
`;
code = code.replace("    </div>\n  );\n}", panelHtml + "\n  );\n}");

fs.writeFileSync(filePath, code);

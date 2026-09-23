import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataGrid({
  columns = [],
  data = [],
  keyField = 'id',
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No records found',
  searchPlaceholder = 'Filter records...',
  filterTabs = [],
  activeFilterTab,
  onFilterTabChange,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      if (sortAsc) setSortAsc(false);
      else {
        setSortField(null);
        setSortAsc(true);
      }
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Local Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return sortAsc ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortAsc]);

  // Pagination Slice
  const totalPages = Math.ceil(processedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, page, pageSize]);

  // Selection Handlers
  const isAllSelected = paginatedData.length > 0 && paginatedData.every((r) => selectedIds.includes(r[keyField]));

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const newIds = Array.from(new Set([...selectedIds, ...paginatedData.map((r) => r[keyField])]));
      onSelectionChange(newIds);
    } else {
      const pageIds = new Set(paginatedData.map((r) => r[keyField]));
      onSelectionChange(selectedIds.filter((id) => !pageIds.has(id)));
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Table Toolbar & Filter Tabs */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Filter Tabs if provided */}
        {filterTabs.length > 0 ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            {filterTabs.map((tab) => {
              const isActive = activeFilterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPage(1);
                    onFilterTabChange && onFilterTabChange(tab.id);
                  }}
                  className={`fluent-btn ${isActive ? 'fluent-btn-primary' : 'fluent-btn-subtle'}`}
                  style={{ fontSize: '12px', padding: '4px 10px', height: '28px' }}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      style={{
                        marginLeft: '4px',
                        padding: '1px 5px',
                        borderRadius: '999px',
                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-alt)',
                        fontSize: '10px',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div />
        )}

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search
            size={14}
            color="var(--color-text-secondary)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="fluent-input"
            style={{ paddingLeft: '30px', height: '30px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '13px',
          }}
        >
          {/* Header */}
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-surface-alt)',
                borderBottom: '1px solid var(--color-border)',
                height: '36px',
                position: 'sticky',
                top: 0,
                zIndex: 2,
              }}
            >
              {onSelectionChange && (
                <th style={{ width: '40px', padding: '0 0 0 16px', verticalAlign: 'middle' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.field}
                  onClick={() => col.sortable !== false && handleSort(col.field)}
                  style={{
                    padding: '8px 12px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    fontSize: '12px',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: col.width || 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{col.header}</span>
                    {col.sortable !== false && (
                      <span style={{ display: 'inline-flex', opacity: sortField === col.field ? 1 : 0.4 }}>
                        {sortField === col.field ? (
                          sortAsc ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}
                >
                  Loading records...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedIds.includes(row[keyField]);
                return (
                  <tr
                    key={row[keyField]}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      height: 'var(--grid-row-height)',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {onSelectionChange && (
                      <td
                        style={{ width: '40px', padding: '0 0 0 16px', verticalAlign: 'middle' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(e, row[keyField])}
                          style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.field}
                        style={{
                          padding: '6px 12px',
                          color: 'var(--color-text-primary)',
                          whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                          maxWidth: col.maxWidth || 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {col.render ? col.render(row[col.field], row) : (row[col.field] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-alt)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div>
          {processedData.length > 0 ? (
            <span>
              Showing {Math.min((page - 1) * pageSize + 1, processedData.length)} to{' '}
              {Math.min(page * pageSize, processedData.length)} of {processedData.length} records
              {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
            </span>
          ) : (
            <span>0 records</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="fluent-select"
              style={{ width: '64px', height: '26px', padding: '2px 4px', fontSize: '11px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="fluent-btn-subtle"
              style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="fluent-btn-subtle"
              style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

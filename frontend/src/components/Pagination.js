import React from 'react';

/**
 * Generic pager for DRF's PageNumberPagination response shape:
 * { count, next, previous, results }.
 * Renders numbered pages with ellipses, plus Prev/Next.
 */
export default function Pagination({ count, pageSize, currentPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;

  const pages = [];
  const onEachSide = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= onEachSide) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <nav className="pagination-wrap" aria-label="Page navigation">
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            <i className="bi bi-chevron-left"></i>
          </button>
        </li>

        {pages.map((p, idx) =>
          p === '…' ? (
            <li key={`ellipsis-${idx}`} className="page-item disabled"><span className="page-link">…</span></li>
          ) : (
            <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(p)}>{p}</button>
            </li>
          )
        )}

        <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
}

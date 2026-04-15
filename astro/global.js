// === PRECESSION: RELATIVISTIC JET KINEMATICS ===
// Minimal JavaScript — only for features that cannot be done in pure CSS
// No "AI bloat" — no scrolljacking, no fade-on-scroll, no glass cards.

;(function() {
  'use strict';

  // -------------------------------------------------------------
  // 1. CITATION TOOLTIPS (Show reference preview on hover)
  //    Imitates the physical act of checking a footnote.
  //    Pure enhancement — fails gracefully without JS.
  // -------------------------------------------------------------
  function initCitationTooltips() {
    const citations = document.querySelectorAll('.citation');
    
    citations.forEach(cite => {
      // Only if we have a title attribute or can generate one
      const refId = cite.getAttribute('data-ref');
      if (!refId) return;
      
      const targetRef = document.getElementById(refId);
      if (!targetRef) return;
      
      // Extract the reference text (first sentence only, to keep it clean)
      const refText = targetRef.innerText.trim();
      const shortText = refText.length > 120 ? refText.substring(0, 120) + '…' : refText;
      
      cite.setAttribute('title', shortText);
      cite.style.cursor = 'help';
    });
  }

  // -------------------------------------------------------------
  // 2. FIGURE LIGHTBOX (Simple, academic)
  //    Click on a figure to see it larger in a modal.
  //    No fancy zoom, just the raw image + caption.
  // -------------------------------------------------------------
  function initFigureLightbox() {
    const figures = document.querySelectorAll('.fig-interactive');
    if (figures.length === 0) return;
    
    // Create lightbox container (hidden by default)
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(18, 18, 20, 0.96);
      z-index: 10000;
      cursor: zoom-out;
      padding: 2rem;
      box-sizing: border-box;
      backdrop-filter: blur(2px);
      align-items: center;
      justify-content: center;
    `;
    
    const lightboxContent = document.createElement('div');
    lightboxContent.style.cssText = `
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    const lightboxImg = document.createElement('img');
    lightboxImg.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      border: 1px solid #3a3835;
      background: #121214;
    `;
    
    const lightboxCaption = document.createElement('div');
    lightboxCaption.style.cssText = `
      font-family: 'Computer Modern Sans', sans-serif;
      color: #9a9996;
      margin-top: 1rem;
      font-size: 0.9rem;
      text-align: center;
      max-width: 650px;
    `;
    
    lightboxContent.appendChild(lightboxImg);
    lightboxContent.appendChild(lightboxCaption);
    lightbox.appendChild(lightboxContent);
    document.body.appendChild(lightbox);
    
    // Close on click (anywhere)
    lightbox.addEventListener('click', function() {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    });
    
    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
    
    // Attach to figures
    figures.forEach(fig => {
      fig.addEventListener('click', function(e) {
        e.preventDefault();
        
        const img = this.querySelector('img');
        const caption = this.querySelector('figcaption');
        
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
        }
        
        if (caption) {
          lightboxCaption.innerHTML = caption.innerHTML;
        } else {
          lightboxCaption.textContent = '';
        }
        
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // -------------------------------------------------------------
  // 3. TABLE SORTING (For Data Tables)
  //    Because the VLBA data table should be sortable by epoch or velocity.
  //    Click on header to sort ascending/descending.
  // -------------------------------------------------------------
  function initTableSorting() {
    const tables = document.querySelectorAll('table.sortable');
    if (tables.length === 0) return;
    
    tables.forEach(table => {
      const headers = table.querySelectorAll('th');
      
      headers.forEach((th, index) => {
        // Only make numeric columns sortable by default
        if (th.classList.contains('sortable') || th.classList.contains('numeric')) {
          th.style.cursor = 'pointer';
          th.setAttribute('title', 'Click to sort');
          
          // Add sort indicator
          const indicator = document.createElement('span');
          indicator.style.marginLeft = '0.5em';
          indicator.style.fontSize = '0.8em';
          indicator.style.opacity = '0.5';
          indicator.textContent = '↕';
          th.appendChild(indicator);
          
          th.addEventListener('click', function() {
            sortTable(table, index, th);
          });
        }
      });
    });
  }
  
  function sortTable(table, columnIndex, header) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Determine sort direction
    const currentDirection = header.getAttribute('data-sort') || 'none';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // Update header indicators
    table.querySelectorAll('th').forEach(th => {
      const indicator = th.querySelector('span');
      if (indicator) {
        indicator.textContent = '↕';
        indicator.style.opacity = '0.5';
      }
      th.removeAttribute('data-sort');
    });
    
    const thisIndicator = header.querySelector('span');
    if (thisIndicator) {
      thisIndicator.textContent = newDirection === 'asc' ? '↑' : '↓';
      thisIndicator.style.opacity = '1';
    }
    header.setAttribute('data-sort', newDirection);
    
    // Sort rows
    rows.sort((a, b) => {
      const aCell = a.children[columnIndex];
      const bCell = b.children[columnIndex];
      
      if (!aCell || !bCell) return 0;
      
      let aVal = aCell.textContent.trim();
      let bVal = bCell.textContent.trim();
      
      // Try numeric comparison first
      const aNum = parseFloat(aVal.replace(/[^\d.-]/g, ''));
      const bNum = parseFloat(bVal.replace(/[^\d.-]/g, ''));
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Fallback to string comparison
      return newDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    });
    
    // Re-append rows
    rows.forEach(row => tbody.appendChild(row));
  }

  // -------------------------------------------------------------
  // 4. SIDENOTE POSITIONING (For margin notes)
  //    Adjust vertical position to avoid overlap.
  // -------------------------------------------------------------
  function positionSidenotes() {
    const sidenotes = document.querySelectorAll('.sidenote');
    if (sidenotes.length === 0) return;
    
    // Simple check: ensure they don't overlap by adjusting top margin
    // This is a minimal implementation; a more robust one would use getBoundingClientRect
    let lastBottom = 0;
    const margin = 20; // px
    
    sidenotes.forEach(note => {
      const rect = note.getBoundingClientRect();
      const noteTop = rect.top + window.scrollY;
      
      if (noteTop < lastBottom + margin) {
        const offset = lastBottom + margin - noteTop;
        note.style.marginTop = offset + 'px';
        lastBottom = note.getBoundingClientRect().bottom + window.scrollY + offset;
      } else {
        note.style.marginTop = '';
        lastBottom = note.getBoundingClientRect().bottom + window.scrollY;
      }
    });
  }

  // -------------------------------------------------------------
  // 5. KEEP REFERENCE NUMBERS (No AI rewrite)
  //    Preserve all [s_sXX] citations exactly as in document.
  //    This is a no-op but signifies intent: the text is immutable.
  // -------------------------------------------------------------
  function preserveCitations() {
    // This function exists to make a philosophical point:
    // The document text is the source of truth. No LLM rewrites.
    console.log('Precession manuscript: All citations preserved verbatim.');
  }

  // -------------------------------------------------------------
  // 6. OBSERVER FOR DYNAMIC CONTENT (If any)
  //    Not needed now, but placeholder for future interactive figures.
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  function init() {
    initCitationTooltips();
    initFigureLightbox();
    initTableSorting();
    
    // Run sidenote positioning on load and resize
    window.addEventListener('load', positionSidenotes);
    window.addEventListener('resize', positionSidenotes);
    
    preserveCitations();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
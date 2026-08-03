/**
 * Common Excel Export Configuration & Styles for Hepco System
 */
export const EXCEL_STYLES = {
  // Title styles (Hepco Green background, bold 14pt white font)
  FONT_TITLE: { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FFFFFFFF' } },
  FILL_TITLE: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } },

  // Sub-section header styles (Slate gray background, bold 11pt dark font)
  FONT_SECTION: { name: 'Times New Roman', size: 11, bold: true, color: { argb: 'FF0F172A' } },
  FILL_SECTION: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } },

  // Table header styles (Deep green background, bold 10pt white font)
  FONT_HEADER: { name: 'Times New Roman', bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
  FILL_HEADER: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } },

  // Table data row styles (Alternating white / light gray backgrounds)
  FONT_DATA: { name: 'Times New Roman', size: 10, color: { argb: 'FF1F2937' } },
  FILL_EVEN: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
  FILL_ODD: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } },

  // Cell border style
  BORDER_THIN: {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
  },

  // Alignment options
  ALIGN_CENTER: { vertical: 'middle', horizontal: 'center', wrapText: true },
  ALIGN_LEFT: { vertical: 'middle', horizontal: 'left', wrapText: true }
};

/**
 * Helper to sanitize worksheet names according to Excel specifications
 * (max 31 chars, strip invalid characters : \ / ? * [ ])
 */
export const sanitizeSheetName = (name) => {
  if (!name) return 'Sheet1';
  return name.replace(/[:\\/?*[\]]/g, ' ').substring(0, 31).trim() || 'Sheet1';
};

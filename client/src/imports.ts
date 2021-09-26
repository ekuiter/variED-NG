/**
 * Dynamic imports.
 * Because some features of the application are only used on-demand and the involved
 * libraries have a large footprint, dynamic import() is used for these libraries.
 */

export const importCanvg = () => import('canvg');
export const importSvg2PdfJs = () => import('svg2pdf.js');
export const importJspdfYworks = () => null; // import('jspdf-yworks');
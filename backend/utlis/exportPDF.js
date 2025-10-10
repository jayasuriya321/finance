// backend/utils/exportPDF.js
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

// assign vfs correctly
pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs;

export const exportPDF = async (docDefinition) => {
  return new Promise((resolve, reject) => {
    try {
      pdfMake.createPdf(docDefinition).getBuffer((buffer) => resolve(buffer));
    } catch (err) {
      console.error("❌ Error exporting PDF:", err);
      reject(err);
    }
  });
};

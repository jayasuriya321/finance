// src/utils/exportPdf.js
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const exportPDF = (docDefinition, fileName = "document.pdf") => {
  if (!docDefinition) return;

  pdfMake.createPdf(docDefinition).download(fileName);
};

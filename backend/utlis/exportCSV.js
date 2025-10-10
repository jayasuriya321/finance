// backend/utils/exportCSV.js
import { Parser } from "json2csv";

export const exportCSV = (data, fields = null) => {
  try {
    const opts = fields ? { fields } : {};
    const parser = new Parser(opts);
    return parser.parse(data);
  } catch (error) {
    console.error("❌ Error exporting CSV:", error);
    throw new Error("CSV export failed");
  }
};

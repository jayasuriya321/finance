// src/utils/exportUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ Required for table support

// 📘 Export to PDF (Only Amount, Category, Description, Date)
export const exportToPDF = (data, title = "Expense Report") => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // ✅ Only select the required fields
  const headers = ["Amount", "Category", "Description", "Date"];
  const rows = data.map((item) => [
    item.amount || "",
    item.category?.name || item.category || "",
    item.description || "",
    new Date(item.date).toLocaleDateString(),
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [52, 152, 219] }, // blue header
  });

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};

// 📗 Export to CSV (Only Amount, Category, Description, Date)
export const exportToCSV = (data, title = "Expense Report") => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = ["Amount", "Category", "Description", "Date"];
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  data.forEach((item) => {
    const values = [
      `"${item.amount || ""}"`,
      `"${item.category?.name || item.category || ""}"`,
      `"${item.description || ""}"`,
      `"${new Date(item.date).toLocaleDateString()}"`,
    ];
    csvRows.push(values.join(","));
  });

  // Create blob and trigger download
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}.csv`;
  a.click();

  window.URL.revokeObjectURL(url);
};

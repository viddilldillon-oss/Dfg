// backend/utils/ocrParser.js
const fs = require("fs/promises");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
const XLSX = require("xlsx");

/**
 * Extract text from any supported file (PDF, DOCX, XLSX, or image)
 */
exports.extractTextFromFile = async function extractTextFromFile(filePath, mimeType = "") {
  const ext = (path.extname(filePath) || "").toLowerCase();
  const type = (mimeType || "").toLowerCase();

  // ✅ Excel (.xlsx)
  if (ext === ".xlsx" || type.includes("spreadsheetml")) {
    const buf = await fs.readFile(filePath);
    const workbook = XLSX.read(buf, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Convert Excel rows to text format (for reuse by parser)
    const textLines = [];
    json.forEach((row) => {
      const vals = Object.values(row)
        .map((v) => String(v).trim())
        .filter(Boolean);
      if (vals.length) textLines.push(vals.join("  "));
    });
    return textLines.join("\n");
  }

  // ✅ PDF
  if (ext === ".pdf" || type.includes("pdf")) {
    const buf = await fs.readFile(filePath);
    const res = await pdfParse(buf);
    return res.text || "";
  }

  // ✅ DOCX (Word)
  if (ext === ".docx" || type.includes("wordprocessingml.document")) {
    const buf = await fs.readFile(filePath);
    const res = await mammoth.extractRawText({ buffer: buf });
    return res.value || "";
  }

  // ✅ Image-based OCR (JPG, PNG, etc.)
  const { data } = await Tesseract.recognize(filePath, "eng", { logger: () => {} });
  return data.text || "";
};

/**
 * Parse text into structured supplier rows.
 * Optimized for tables like:
 * Item Name | Category | Potential Quantity | Unit Cost | Total Cost | Notes
 */
exports.parseTextToRows = function parseTextToRows(text) {
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const headerIndex = lines.findIndex((line) =>
    /item\s*name.*category.*potential\s*quantity.*unit\s*cost.*total\s*cost.*notes/i.test(line)
  );

  const rows = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Split by commas, tabs, or multiple spaces
    const parts = line.split(/,|\t|\s{2,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;

    const [itemName, category, quantity, unitCost, totalCost, notes] = parts;

    if (!itemName && !category && !quantity && !unitCost && !totalCost && !notes) continue;

    rows.push({
      name: "Default Supplier", // ✅ always default
      product: itemName || "",
      category: category || "",
      quantity: Number(quantity) || 0,
      unitCost: Number(unitCost) || 0,
      total: Number(totalCost) || 0,
      notes: notes || "",
      contact: "",
    });
  }

  return rows;
};

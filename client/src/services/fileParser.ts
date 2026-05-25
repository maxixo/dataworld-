import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  data: any[];
  columns: string[];
}

type TabularRow = Record<string, string | number | boolean | null>;

const normalizeCellValue = (value: unknown): string | number | boolean | null => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : '';
  }

  if (typeof value === 'boolean' || typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const sanitizeParsedRows = (rows: unknown[]): ParsedFile => {
  const objectRows = rows.filter((row): row is Record<string, unknown> =>
    typeof row === 'object' && row !== null && !Array.isArray(row)
  );

  if (objectRows.length === 0) {
    throw new Error('File must contain at least one row of object data');
  }

  const columnSet = new Set<string>();
  objectRows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const normalizedKey = String(key).trim();
      if (normalizedKey) {
        columnSet.add(normalizedKey);
      }
    });
  });

  const columns = Array.from(columnSet);

  if (columns.length === 0) {
    throw new Error('File must contain at least one column');
  }

  const data: TabularRow[] = objectRows.map((row) => {
    const normalizedRow: TabularRow = {};

    columns.forEach((column) => {
      normalizedRow[column] = normalizeCellValue(row[column]);
    });

    return normalizedRow;
  });

  return { data, columns };
};

export async function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          resolve(sanitizeParsedRows(results.data as unknown[]));
        } catch (error) {
          reject(error);
        }
      },
      error: (err) => {
        reject(new Error(`Failed to parse CSV: ${err.message}`));
      }
    });
  });
}

export async function parseExcel(file: File): Promise<ParsedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
    blankrows: false
  });
  
  if (jsonData.length === 0) {
    throw new Error('Excel file is empty or has no data');
  }

  return sanitizeParsedRows(jsonData as unknown[]);
}

export async function parseJSON(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const jsonData = JSON.parse(text);
  
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('JSON file must contain a non-empty array of objects');
  }

  return sanitizeParsedRows(jsonData);
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    default:
      throw new Error('Unsupported file type. Please upload CSV, Excel, or JSON files.');
  }
}

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  data: any[];
  columns: string[];
}

type TabularRow = Record<string, string | number | boolean | null>;
type SupportedFileType = 'csv' | 'json' | 'xlsx';

const SUPPORTED_MIME_TYPES: Record<SupportedFileType, string[]> = {
  csv: ['text/csv', 'application/csv', 'text/plain'],
  json: ['application/json', 'text/json'],
  xlsx: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream'
  ]
};

export const SUPPORTED_FILE_INPUT_ACCEPT = [
  '.csv',
  '.json',
  '.xlsx',
  '.xls',
  ...SUPPORTED_MIME_TYPES.csv,
  ...SUPPORTED_MIME_TYPES.json,
  ...SUPPORTED_MIME_TYPES.xlsx
].join(',');

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

const isBlankValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  return false;
};

const isRowEmpty = (row: Record<string, unknown>): boolean =>
  Object.values(row).every((value) => isBlankValue(value));

const getFileExtension = (file: File): string => file.name.split('.').pop()?.toLowerCase() || '';

const inferFileType = (file: File): SupportedFileType | null => {
  const extension = getFileExtension(file);

  if (extension === 'csv') {
    return 'csv';
  }

  if (extension === 'json') {
    return 'json';
  }

  if (extension === 'xlsx' || extension === 'xls') {
    return 'xlsx';
  }

  const mimeType = file.type.toLowerCase();

  if (SUPPORTED_MIME_TYPES.csv.includes(mimeType)) {
    return 'csv';
  }

  if (SUPPORTED_MIME_TYPES.json.includes(mimeType)) {
    return 'json';
  }

  if (SUPPORTED_MIME_TYPES.xlsx.includes(mimeType)) {
    return 'xlsx';
  }

  return null;
};

export const isSupportedUploadFile = (file: File): boolean => inferFileType(file) !== null;

const normalizeColumnName = (value: unknown, index: number, usedNames: Set<string>): string => {
  const rawName = String(value ?? '').trim() || `Column ${index + 1}`;
  let candidate = rawName;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    candidate = `${rawName} (${suffix})`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
};

const sanitizeParsedRows = (rows: unknown[]): ParsedFile => {
  const objectRows = rows.filter((row): row is Record<string, unknown> =>
    typeof row === 'object' && row !== null && !Array.isArray(row)
  );

  const nonEmptyRows = objectRows.filter((row) => !isRowEmpty(row));

  if (nonEmptyRows.length === 0) {
    throw new Error('File must contain at least one row of object data');
  }

  const columnSet = new Set<string>();
  nonEmptyRows.forEach((row) => {
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

  const data: TabularRow[] = nonEmptyRows.map((row) => {
    const normalizedRow: TabularRow = {};

    columns.forEach((column) => {
      normalizedRow[column] = normalizeCellValue(row[column]);
    });

    return normalizedRow;
  });

  return { data, columns };
};

const normalizeTabularRows = (rows: unknown[][]): ParsedFile => {
  const nonEmptyRows = rows.filter(
    (row): row is unknown[] => Array.isArray(row) && row.some((value) => !isBlankValue(value))
  );

  if (nonEmptyRows.length < 2) {
    throw new Error('File must include a header row and at least one data row');
  }

  const usedNames = new Set<string>();
  const headers = nonEmptyRows[0].map((value, index) => normalizeColumnName(value, index, usedNames));
  const dataRows = nonEmptyRows.slice(1);

  const normalizedRows = dataRows.map((row) => {
    const normalizedRow: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      normalizedRow[header] = row[index] ?? '';
    });

    return normalizedRow;
  });

  return sanitizeParsedRows(normalizedRows);
};

export async function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          resolve(normalizeTabularRows(results.data as unknown[][]));
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
  if (!sheetName) {
    throw new Error('Excel file does not contain any worksheets');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false
  });

  return normalizeTabularRows(rows as unknown[][]);
}

const normalizeJsonPayload = (payload: unknown): ParsedFile => {
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      throw new Error('JSON file must contain at least one row');
    }

    if (payload.every((row) => Array.isArray(row))) {
      return normalizeTabularRows(payload as unknown[][]);
    }

    return sanitizeParsedRows(payload);
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const tabularKeys = ['data', 'rows', 'items', 'records', 'results'];

    for (const key of tabularKeys) {
      if (Array.isArray(record[key])) {
        return normalizeJsonPayload(record[key]);
      }
    }

    const firstArrayValue = Object.values(record).find((value) => Array.isArray(value));
    if (Array.isArray(firstArrayValue)) {
      return normalizeJsonPayload(firstArrayValue);
    }

    return sanitizeParsedRows([record]);
  }

  throw new Error('JSON file must contain an object, an array of objects, or tabular rows');
};

export async function parseJSON(file: File): Promise<ParsedFile> {
  try {
    const text = await file.text();
    return normalizeJsonPayload(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON file is not valid JSON');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to parse JSON file');
  }
}

export async function parseFile(file: File): Promise<ParsedFile> {
  switch (inferFileType(file)) {
    case 'csv':
      return parseCSV(file);
    case 'xlsx':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    default:
      throw new Error('Unsupported file type. Please upload CSV, Excel, or JSON files.');
  }
}

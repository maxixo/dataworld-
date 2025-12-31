import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  data: any[];
  columns: string[];
}

export async function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve({
          data: results.data,
          columns: results.meta.fields || []
        });
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
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  if (jsonData.length === 0) {
    throw new Error('Excel file is empty or has no data');
  }
  
  return {
    data: jsonData,
    columns: Object.keys(jsonData[0] as object)
  };
}

export async function parseJSON(file: File): Promise<ParsedFile> {
  const text = await file.text();
  const jsonData = JSON.parse(text);
  
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('JSON file must contain a non-empty array of objects');
  }
  
  return {
    data: jsonData,
    columns: Object.keys(jsonData[0] as object)
  };
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

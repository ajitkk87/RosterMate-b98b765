import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv/sync';
import { randomUUID } from 'crypto';

export interface CsvRow {
  [key: string]: string | number | boolean | undefined;
  _id?: string;
}

export class CsvDatabase {
  private dataDir: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private getFilePath(collection: string): string {
    return path.join(this.dataDir, `${collection}.csv`);
  }

  private ensureIdColumn(record: CsvRow): CsvRow {
    if (!record._id) {
      record._id = randomUUID();
    }
    return record;
  }

  /**
   * Read all records from a CSV file
   */
  async find(collection: string, filter?: Partial<CsvRow>): Promise<CsvRow[]> {
    const filePath = this.getFilePath(collection);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.trim()) {
      return [];
    }

    try {
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
      }) as CsvRow[];

      if (!filter) {
        return records;
      }

      // Simple filter matching
      return records.filter(record => {
        for (const [key, value] of Object.entries(filter)) {
          if (record[key] !== String(value)) {
            return false;
          }
        }
        return true;
      });
    } catch (err) {
      console.error(`Error parsing CSV file ${filePath}:`, err);
      return [];
    }
  }

  /**
   * Find a single record by ID
   */
  async findById(collection: string, id: string): Promise<CsvRow | null> {
    const records = await this.find(collection, { _id: id });
    return records[0] || null;
  }

  /**
   * Find a single record by any field
   */
  async findOne(collection: string, filter: Partial<CsvRow>): Promise<CsvRow | null> {
    const records = await this.find(collection, filter);
    return records[0] || null;
  }

  /**
   * Insert a new record
   */
  async insertOne(collection: string, record: CsvRow): Promise<CsvRow> {
    record = this.ensureIdColumn(record);
    const filePath = this.getFilePath(collection);

    let records: CsvRow[] = [];
    if (fs.existsSync(filePath)) {
      records = await this.find(collection);
    }

    records.push(record);
    this.writeRecords(filePath, records);
    return record;
  }

  /**
   * Insert multiple records
   */
  async insertMany(collection: string, records: CsvRow[]): Promise<CsvRow[]> {
    const filePath = this.getFilePath(collection);
    records = records.map(r => this.ensureIdColumn(r));

    let existing: CsvRow[] = [];
    if (fs.existsSync(filePath)) {
      existing = await this.find(collection);
    }

    const allRecords = [...existing, ...records];
    this.writeRecords(filePath, allRecords);
    return records;
  }

  /**
   * Update a record by ID
   */
  async updateOne(collection: string, id: string, update: Partial<CsvRow>): Promise<CsvRow | null> {
    const filePath = this.getFilePath(collection);
    const records = await this.find(collection);

    const index = records.findIndex(r => r._id === id);
    if (index === -1) {
      return null;
    }

    records[index] = { ...records[index], ...update, _id: id };
    this.writeRecords(filePath, records);
    return records[index];
  }

  /**
   * Delete a record by ID
   */
  async deleteOne(collection: string, id: string): Promise<boolean> {
    const filePath = this.getFilePath(collection);
    const records = await this.find(collection);

    const index = records.findIndex(r => r._id === id);
    if (index === -1) {
      return false;
    }

    records.splice(index, 1);
    this.writeRecords(filePath, records);
    return true;
  }

  /**
   * Delete multiple records by filter
   */
  async deleteMany(collection: string, filter: Partial<CsvRow>): Promise<number> {
    const filePath = this.getFilePath(collection);
    const records = await this.find(collection);

    const initialLength = records.length;
    const filtered = records.filter(record => {
      for (const [key, value] of Object.entries(filter)) {
        if (record[key] !== String(value)) {
          return true; // Keep this record
        }
      }
      return false; // Delete this record
    });

    this.writeRecords(filePath, filtered);
    return initialLength - filtered.length;
  }

  /**
   * Count records matching a filter
   */
  async countDocuments(collection: string, filter?: Partial<CsvRow>): Promise<number> {
    const records = await this.find(collection, filter);
    return records.length;
  }

  /**
   * Clear all records from a collection
   */
  async deleteAll(collection: string): Promise<void> {
    const filePath = this.getFilePath(collection);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private writeRecords(filePath: string, records: CsvRow[]): void {
    if (records.length === 0) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return;
    }

    try {
      const csv = stringify(records, { header: true });
      fs.writeFileSync(filePath, csv, 'utf-8');
    } catch (err) {
      console.error(`Error writing CSV file ${filePath}:`, err);
      throw err;
    }
  }
}

export default CsvDatabase;

import dotenv from 'dotenv';
import path from 'path';
import CsvDatabase from '../utils/csv-db';

dotenv.config();

let csvDb: CsvDatabase;

const connectDB = async (): Promise<void> => {
  try {
    // Initialize CSV database with data directory from .env or default
    const dataDir = process.env.CSV_DATA_DIR || path.join(process.cwd(), 'data');
    csvDb = new CsvDatabase(dataDir);

    console.log(`CSV Database initialized at: ${dataDir}`);

    process.on('SIGINT', async () => {
      try {
        console.log('CSV database connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export {
  connectDB,
  csvDb,
};
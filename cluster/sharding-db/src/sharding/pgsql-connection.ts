/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, QueryResult } from 'pg';

export class PGDatabase {
  private client: Client;

  constructor(connectionString: string) {
    this.client = new Client({ connectionString });
  }

  // Connect to the database once
  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Database connected.');
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  // Execute a query and return the result
  async query<T = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<any>> {
    try {
      return this.client.query(text, params);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  // Close the connection explicitly when needed
  async disconnect(): Promise<void> {
    try {
      await this.client.end();
      console.log('Database disconnected.');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }
}

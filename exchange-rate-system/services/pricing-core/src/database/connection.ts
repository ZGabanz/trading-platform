import { Pool, PoolClient } from "pg";
import { logger } from "../utils/logger";
import { config } from "../config/environment";

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.username,
      password: config.database.password,
      ssl: config.database.ssl,
      max: config.database.maxConnections,
      idleTimeoutMillis: config.database.acquireTimeout,
      connectionTimeoutMillis: config.database.timeout,
    });

    this.setupEventHandlers();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private setupEventHandlers(): void {
    this.pool.on("connect", (client: PoolClient) => {
      logger.info("Database client connected", {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount,
      });
    });

    this.pool.on("error", (err: Error) => {
      logger.error("Database connection error", { error: err.message });
    });

    this.pool.on("remove", () => {
      logger.info("Database client removed from pool");
    });
  }

  public async connect(): Promise<void> {
    try {
      // Test the connection
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      this.isConnected = true;
      logger.info("Database connection established successfully", {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
      });
    } catch (error) {
      this.isConnected = false;
      logger.error("Failed to connect to database", { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info("Database connection closed");
    } catch (error) {
      logger.error("Error closing database connection", { error });
      throw error;
    }
  }

  public async query(text: string, params?: any[]): Promise<any> {
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      logger.debug("Database query executed", {
        query: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        duration,
        rowCount: result.rowCount,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error("Database query failed", {
        query: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }
    return this.pool.connect();
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public isHealthy(): boolean {
    return this.isConnected && this.pool.totalCount > 0;
  }

  public getStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      isConnected: this.isConnected,
    };
  }
}

export const db = DatabaseConnection.getInstance();

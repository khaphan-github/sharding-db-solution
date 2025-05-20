/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CommandHandler,
  ICommand,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GetShardingByIndexQuery } from './get-sharding-config.query';
import { PGDatabase } from './pgsql-connection';

export class ExecuteShardingSQLCommand implements ICommand {
  constructor(
    public readonly query: string,
    public readonly uniqueId?: number,
    public readonly params?: any[],
    public readonly maxSharding = 3,
  ) { }
}

@CommandHandler(ExecuteShardingSQLCommand)
export class ExecuteShardingSQLHandler
  implements ICommandHandler<ExecuteShardingSQLCommand> {
  private readonly pollingMap = new Map<number, PGDatabase>();
  constructor(private readonly queryBus: QueryBus) { }
  async execute(command: ExecuteShardingSQLCommand): Promise<any> {
    const uniqueId = command.uniqueId;
    if (uniqueId == undefined) {
      throw new Error('Failed to generate unique ID');
    }

    const shardingIndex = +uniqueId % command.maxSharding;
    let client = this.pollingMap.get(shardingIndex);
    if (!client) {
      console.log(
        `Creating new connection for sharding index: ${shardingIndex}`,
      );
      const conf: any = await this.queryBus.execute(
        new GetShardingByIndexQuery(shardingIndex),
      );
      const connection = conf['config'] ?? '';
      const db = new PGDatabase(connection);
      await db.connect();
      this.pollingMap.set(shardingIndex, db);
      client = db;
    }

    if (!client) {
      throw new Error('Failed to create database connection');
    }
    const result = await client.query(command.query, command.params);
    console.log('PostgreSQL version:', result.rows[0]);

    return Promise.resolve([result.rows[0]]);
  }
}

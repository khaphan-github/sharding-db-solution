/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// Define the query with an index parameter
export class GetShardingByIndexQuery {
  constructor(public readonly index: number) {}
}

// Define the expected return type for the sharding data
export interface ShardingData {
  index: number;
  config?: any;
}

@QueryHandler(GetShardingByIndexQuery)
export class GetShardingByIndexQueryHandler
  implements IQueryHandler<GetShardingByIndexQuery>
{
  private configPath = path.join(process.cwd(), 'conf', 'sharding.yaml');
  private shardingConfig: Map<number, any>;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const fileContents = fs.readFileSync(this.configPath, 'utf8');
      const config = yaml.parse(fileContents) as Record<string, any>;
      console.log('Sharding configuration loaded:', config);

      // Convert the config to a map with index as key
      this.shardingConfig = new Map();
      if (config.sharding && Array.isArray(config.sharding)) {
        config.sharding.forEach((shard: any) => {
          if (shard['sharding_index'] !== undefined) {
            this.shardingConfig.set(
              shard['sharding_index'],
              shard['connections'],
            );
          }
        });
      }
    } catch (error) {
      console.error('Failed to load sharding configuration:', error);
      this.shardingConfig = new Map();
    }
  }

  async execute(query: GetShardingByIndexQuery): Promise<ShardingData | null> {
    const { index } = query;

    // Get sharding configuration by index
    const shardConfig = this.shardingConfig.get(index);

    if (!shardConfig) {
      return null;
    }

    const shardingData: ShardingData = {
      index,
      config: shardConfig,
    };

    return Promise.resolve(shardingData);
  }
}

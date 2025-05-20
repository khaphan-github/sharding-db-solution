import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ExecuteShardingSQLCommand } from './sharding/execute-sql-sharding.command';
import { InsertUserShardingDto } from './dto/insert-user-sharding.dto';
import { Snowflake } from './snowflake-id/snowflake-id';

@Controller()
export class AppController {
  constructor(private readonly commandBus: CommandBus) { }

  @Get('migrate')
  async migrate() {
    const sql = `
      CREATE TABLE IF NOT EXISTs user_sharding (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255),
          phone VARCHAR(20),
          email VARCHAR(255),
          address TEXT,
          user_create INT,
          user_update INT,
          time_create TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          time_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status BOOLEAN DEFAULT TRUE,
          avatar TEXT
    )
    `;
    await this.commandBus.execute(new ExecuteShardingSQLCommand(sql, 0));
    await this.commandBus.execute(new ExecuteShardingSQLCommand(sql, 1));
    await this.commandBus.execute(new ExecuteShardingSQLCommand(sql, 2));
    return { message: 'Migration started' };
  }

  @Post('user')
  async createUser(@Body() userDto: InsertUserShardingDto) {
    const uniqueId = +Snowflake.generate();
    await this.commandBus.execute(
      new ExecuteShardingSQLCommand(
        `
      INSERT INTO user_sharding (id, name, phone, email, address, user_create, user_update, time_create, time_update, status, avatar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `,
        uniqueId,
        [
          uniqueId,
          userDto.name,
          userDto.phone ?? null,
          userDto.email,
          userDto.address ?? null,
          userDto.user_create,
          userDto.user_update ?? null,
          userDto.time_create ?? null,
          userDto.time_update ?? null,
          userDto.status ?? true,
          userDto.avatar ?? null,
        ],
      ),
    );
    return {
      message: 'User created',
      data: {
        id: uniqueId,
      },
    };
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class InsertUserShardingDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the user',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Address of the user',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 101,
    description: 'ID of the user who created this record',
  })
  user_create: number;

  @ApiProperty({
    example: 102,
    description: 'ID of the user who last updated this record',
    required: false,
  })
  user_update?: number;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'Timestamp when the record was created',
    required: false,
  })
  time_create?: Date;

  @ApiProperty({
    example: '2023-01-02T00:00:00Z',
    description: 'Timestamp when the record was last updated',
    required: false,
  })
  time_update?: Date;

  @ApiProperty({
    example: true,
    description: 'Status of the user',
    required: false,
  })
  status?: boolean;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: "URL to the user's avatar",
    required: false,
  })
  avatar?: string;
}

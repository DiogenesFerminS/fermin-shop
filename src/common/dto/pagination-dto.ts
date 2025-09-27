/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    example: 10,
    description: 'How many rows do you need',
  })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    example: 5,
    description: 'How many rows do you want skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}

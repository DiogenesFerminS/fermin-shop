/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    nullable: false,
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  stock?: number;

  @ApiProperty()
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty()
  @IsIn(['men', 'women', 'kids', 'unisex'])
  gender: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @MinLength(3, { each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

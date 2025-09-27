import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ProductImage } from './product-image.entity';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '4a0eb38a-3783-4d47-8c30-d3397be6cc1c',
    description: 'Product Id',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Tesla',
    description: 'Product title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column({ type: 'float', default: 0 })
  price: number;

  @ApiProperty({
    example:
      'Cillum minim do commodo ad consectetur et quis commodo non nulla minim.',
    description: 'Product description',
    default: null,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'T-Shirt_Tesla',
    description: 'Product slug form SEO',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L'],
    description: 'Product sizes',
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product Gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty()
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInser() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}

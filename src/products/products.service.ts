import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CreateProductDto, UpdateProductDto } from './dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { IErrorsTypeORM } from 'src/common/interfaces/TypeOrmErrors.interface';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { validate as IsUuid } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productsRepository.create(createProductDto);
      const savedProduct = await this.productsRepository.save(newProduct);
      return savedProduct;
    } catch (error) {
      this.handlerDbExeptions(error as IErrorsTypeORM);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productsRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product | null;

    if (IsUuid(term)) {
      product = await this.productsRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productsRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title) =:title or slug =:slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productsRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    try {
      const productSaved = await this.productsRepository.save(product);
      return productSaved;
    } catch (error) {
      this.handlerDbExeptions(error as IErrorsTypeORM);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    try {
      await this.productsRepository.remove(product);
      return { message: 'Product deleted' };
    } catch {
      throw new BadRequestException(`Deleted failed`);
    }
  }

  private handlerDbExeptions(error: IErrorsTypeORM) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}

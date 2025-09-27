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
import { DataSource, Repository } from 'typeorm';
import { IErrorsTypeORM } from 'src/common/interfaces/TypeOrmErrors.interface';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { validate as IsUuid } from 'uuid';
import { ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const { images = [], ...productsDetails } = createProductDto;

    try {
      const newProduct = this.productsRepository.create({
        ...productsDetails,
        images: images.map((images) =>
          this.productImageRepository.create({ url: images }),
        ),
        user,
      });
      await this.productsRepository.save(newProduct);
      return { ...newProduct, images };
    } catch (error) {
      this.handlerDbExeptions(error as IErrorsTypeORM);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true },
    });

    return products.map((product) => ({
      ...product,
      images: product.images?.map((img) => img.url),
    }));
  }

  async findOne(term: string) {
    let product: Product | null;

    if (IsUuid(term)) {
      product = await this.productsRepository.findOneBy({ id: term });
    } else {
      const queryBuilder =
        this.productsRepository.createQueryBuilder('product');

      product = await queryBuilder
        .where('LOWER(title) =:title or slug =:slug', {
          title: term.toLowerCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'prodImages')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    const plainProduct = {
      ...rest,
      images: images.map((img) => img.url),
    };

    return plainProduct;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productsRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }
      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async deleteAllProducts() {
    const query = this.productsRepository.createQueryBuilder();

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handlerDbExeptions(error as IErrorsTypeORM);
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

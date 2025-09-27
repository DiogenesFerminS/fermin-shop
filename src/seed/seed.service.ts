import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { initialData } from './data/initialData';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteAllTables();
    const user = await this.insertNewUsers();
    await this.insertNewProducts(user);
    return 'Seed executed';
  }

  async insertNewUsers() {
    const usersSeed = initialData.users;

    const users: User[] = [];

    usersSeed.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(users);
    return dbUsers[0];
  }

  private async deleteAllTables() {
    await this.productsService.deleteAllProducts();

    const queryBuild = this.userRepository.createQueryBuilder();
    await queryBuild.delete().where({}).execute();
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();
    const products = initialData.products;

    const insertPromises: any[] = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, user));
    });
    return true;
  }
}

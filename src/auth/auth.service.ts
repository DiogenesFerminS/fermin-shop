import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto, LoginDto } from './dto';
import { User } from './entities/user.entity';
import { IErrorsTypeORM } from '../common/interfaces/TypeOrmErrors.interface';
import { JwtPayload } from './interfaces/jwt-payload.inteface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    //Service para manipular los tokens
    private readonly JwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = this.userRepository.create(createUserDto);

      await this.userRepository.save(newUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userData } = newUser;

      return {
        ...userData,
        token: this.generateJwt({ id: userData.id }),
      };
    } catch (error) {
      this.handlerDbExeptions(error as IErrorsTypeORM);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials (email)');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials (password)');
    }

    return {
      ...user,
      token: this.generateJwt({ id: user.id }),
    };
  }

  checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.generateJwt({ id: user.id }),
    };
  }

  private generateJwt(payload: JwtPayload) {
    const token = this.JwtService.sign(payload);
    return token;
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

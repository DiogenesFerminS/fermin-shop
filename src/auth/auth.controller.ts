import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { RoleProtected } from './decorators/role-protected.decorator';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-status')
  @Auth()
  checkAuth(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  // Se llama automaticamente al strategy que recibe el token que
  // viaja en la peticion como berer token
  @UseGuards(AuthGuard())
  privatePath(
    @GetUser() user: User,
    @GetUser('fullName') userInfo: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    console.log(rawHeaders);
    return {
      ok: true,
      message: 'this is a private rute',
      user,
      userInfo,
    };
  }
  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRouter(@GetUser() user: User) {
    return {
      user,
      ok: true,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  privateRouter2(@GetUser() user: User) {
    return {
      user,
      ok: true,
    };
  }
}

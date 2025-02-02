import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserPayload } from 'src/shared/types/UserTypes';
import config from 'src/config/config';
import { Refresh } from './decorators/refresh.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() { email, password }: { email: string; password: string }) {
    return this.authService.signIn(email, password);
  }

  @Public()
  @Post('/register')
  async create(@Body() createUserDto: UserDocument) {
    return await this.userService.create(createUserDto);
  }

  @Public()
  @Get('/oAuth2')
  getOAuthUrl() {
    const url = this.userService.getOAuthUrl();

    return {
      data: url,
      success: true,
    };
  }

  @Public()
  @Get('/oauth2callback')
  async registerOAuthUser(@Query() code: string, @Res() res: Response) {
    const tokens = await this.userService.verifyOAuthUser(code);

    res.redirect(
      `http://${config.CLIENT}?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    );
  }

  @Refresh()
  @Get('/refresh-token')
  async verifyToken(@Body() body: UserPayload) {
    return this.authService.refreshToken(body.payload._id);
  }

  @Get('/user-list')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/profile')
  async findOne(@Body() body: UserPayload) {
    return {
      data: body.payload,
      success: true,
    };
  }

  @Delete('/profile/:id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}

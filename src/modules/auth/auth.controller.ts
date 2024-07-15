import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { User, UserDocument } from './schema/user.schema';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserPayload } from 'src/shared/types/UserTypes';

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
  async registerOAuthUser(@Query() code: string) {
    try {
      const user = await this.userService.verifyOAuthUser(code);

      return {
        data: user,
        success: true,
        message: 'User Registered Successfully!',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            success: false,
            message: error.message,
          },
          HttpStatus.FORBIDDEN,
          {
            cause: error,
          },
        );
      }

      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          success: false,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
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

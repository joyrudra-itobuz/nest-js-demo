import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserDocument } from './schema/user.schema';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async create(@Body() createCatDto: UserDocument) {
    return await this.userService.create(createCatDto);
  }

  @Get('/oAuth2')
  getOAuthUrl() {
    const url = this.userService.getOAuthUrl();

    return {
      data: url,
      success: true,
    };
  }

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
    }
  }

  @Get('/user-list')
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/profile/:id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Delete('/profile/:id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}

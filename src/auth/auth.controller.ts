import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './auth.service';
import { User, UserDocument } from './schema/user.schema';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  async create(@Body() createCatDto: UserDocument) {
    return await this.userService.create(createCatDto);
  }

  @Get('/oAuth')
  async createOAuthUser() {
    return { success: true };
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

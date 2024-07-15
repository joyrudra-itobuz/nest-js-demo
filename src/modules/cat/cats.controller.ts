import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './schemas/cat.schema';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    try {
      console.log(createCatDto);

      const user = await this.catsService.create(createCatDto);

      return {
        data: user,
        success: true,
        message: 'Hurray! We just made you a new Account!',
      };
    } catch (error) {
      throw new BadRequestException({ success: false });
    }
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cat> {
    return this.catsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.catsService.delete(id);
  }
}

import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class CatsController {
  @Get()
  health() {
    return {
      success: true,
      message: `Server is Up and Running`,
    };
  }
}

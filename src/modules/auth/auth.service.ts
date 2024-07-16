import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import constants from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    if (!(await bcrypt.compare(pass, user.password))) {
      throw new BadRequestException({
        success: false,
        message: 'Wrong Password!',
      });
    }

    const payload = { _id: user._id };

    return {
      data: {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: await this.jwtService.signAsync(payload, {
          secret: constants.JWT_REFRESH_SECRET,
          expiresIn: '180d',
        }),
        user,
      },
      success: true,
      message: 'Welcome Back😍!',
    };
  }

  async refreshToken(_id: string) {
    const payload = { _id };

    return {
      data: {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: await this.jwtService.signAsync(payload, {
          secret: constants.JWT_REFRESH_SECRET,
          expiresIn: '180d',
        }),
      },
      success: true,
    };
  }
}

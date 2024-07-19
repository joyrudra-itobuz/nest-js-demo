import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import config from 'src/config/config';
import bcrypt from 'bcrypt';
import { User } from '../auth/schema/user.schema';
import { CreateUserDto } from '../auth/dto/create.user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  oAuth2Client = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.REDIRECT_URI,
  );

  async create(user: CreateUserDto) {
    const hashedPass = await bcrypt.hash(user.password, 10);

    const createdUser = await this.UserModel.create({
      ...user,
      password: hashedPass,
    });

    if (!createdUser) {
      throw InternalServerErrorException;
    }

    return {
      data: createdUser,
      success: true,
      message: 'Welcome!!🎉',
    };
  }

  getOAuthUrl() {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email', 'openid'],
      prompt: 'consent',
    });
  }

  async verifyOAuthUser(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(tokens);

    const ticket = await this.oAuth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload['email'];
    const name = payload['name'];
    const profileImage = payload.picture;

    const doesUserExists = await this.UserModel.findOne({ email });

    if (doesUserExists) {
      const jwtPayload = { _id: doesUserExists._id };

      return {
        access_token: await this.jwtService.signAsync(jwtPayload),
        refresh_token: await this.jwtService.signAsync(jwtPayload),
      };
    }

    const createdUser = await this.UserModel.create({
      email,
      name,
      profileImage,
    });

    if (!createdUser) {
      throw new Error('Error While Creating a new User!');
    }

    const jwtPayload = { _id: createdUser._id };

    return {
      access_token: await this.jwtService.signAsync(jwtPayload),
      refresh_token: await this.jwtService.signAsync(jwtPayload),
    };
  }

  async verifyToken({
    refresh_token,
    access_token,
  }: {
    refresh_token: string;
    access_token: string;
  }) {
    try {
      const isValidRefreshToken = await this.jwtService.verify(refresh_token);
      const isValidAccessToken = await this.jwtService.verify(access_token);

      if (isValidRefreshToken || isValidAccessToken) {
        return new BadRequestException({
          success: false,
          message: 'Try Signing in again 😢!',
        });
      }

      const isValidUser = await this.UserModel.findById(
        isValidRefreshToken._id,
      );

      if (!isValidUser) {
        throw new Error('Okay?');
      }

      return { success: true, message: 'Welcome 🥰!' };
    } catch (error) {
      return new BadRequestException({
        success: false,
        message: 'Try Signing in again 😢!',
      });
    }
  }

  async findAll(): Promise<User[]> {
    return this.UserModel.find().exec();
  }

  async profile(id: string): Promise<User> {
    return this.UserModel.findOne({ _id: id }).exec();
  }

  async findByEmail(email: string) {
    const user = this.UserModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User Not Found!');
    }

    return user;
  }

  async delete(id: string) {
    const deletedCat = await this.UserModel.findByIdAndDelete({
      _id: id,
    }).exec();
    return deletedCat;
  }
}

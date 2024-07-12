import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { OAuth2Client } from 'google-auth-library';
import config from 'src/config/config';
import { CreateUserDto } from './dto/create.user.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly UserModel: Model<User>,
  ) {}

  oAuth2Client = new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.REDIRECT_URI,
  );

  async create(user: CreateUserDto) {
    const hashedPass = await bcrypt.hash('10', user.password);

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
      return doesUserExists;
    }

    const createdUser = await this.UserModel.create({
      email,
      name,
      profileImage,
    });

    if (!createdUser) {
      throw new Error('Error While Creating a new User!');
    }

    return createdUser;
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

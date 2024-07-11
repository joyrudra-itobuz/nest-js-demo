import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly catModel: Model<User>) {}

  async create(createCatDto: UserDocument) {
    const createdCat = await this.catModel.create(createCatDto);
    return {
      data: createdCat,
      success: true,
      message: 'Whoa! Just Created Your CAT!',
    };
  }

  async findAll(): Promise<User[]> {
    return this.catModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return this.catModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.catModel
      .findByIdAndDelete({ _id: id })
      .exec();
    return deletedCat;
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  toUserResponse,
  UserResponseDto,
} from "./dto/user-response.dto";
import { User, UserDocument } from "./schemas/user.schema";

interface MongoDuplicateError {
  code?: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(email: string, passwordHash: string): Promise<UserDocument> {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      return await this.userModel.create({
        email: normalizedEmail,
        username: normalizedEmail,
        local: { password: passwordHash },
      });
    } catch (error) {
      if ((error as MongoDuplicateError).code === 11000) {
        throw new ConflictException("An account with this email already exists.");
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .exec();
  }

  findByEmailForAuth(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select("+local.password")
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async getCurrentUser(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    return toUserResponse(user);
  }

  async updateCurrentUser(
    id: string,
    input: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found.");
    }

    if (input.email) {
      const normalizedEmail = input.email.trim().toLowerCase();
      user.email = normalizedEmail;
      user.username = normalizedEmail;
    }

    try {
      await user.save();
    } catch (error) {
      if ((error as MongoDuplicateError).code === 11000) {
        throw new ConflictException("An account with this email already exists.");
      }
      throw error;
    }

    return toUserResponse(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: id }, { $set: { "local.password": passwordHash } })
      .exec();
  }
}

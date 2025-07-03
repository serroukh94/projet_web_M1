import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** ───────────────────────────────
   *  Enregistrement + retour JWT   */
  async register(username: string, password: string) {
    // refuse les doublons
    if (await this.userModel.exists({ username })) {
      throw new Error('Username already taken');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ username, passwordHash: hash });
    return this.issueToken(user);
  }

  /** ───────────────────────────────
   *  Login classique                */
  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Bad credentials');
    }
    return this.issueToken(user);
  }

  /** ───────────────────────────────
   *  Génère le JWT + payload user   */
  private issueToken(user: User) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }
}

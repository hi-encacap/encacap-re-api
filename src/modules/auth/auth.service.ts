import { Injectable, Logger } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { omit } from 'lodash';
import { JwtConfigService } from 'src/configs/jwt/jwt-config.service';
import { IUser } from '../user/interfaces/user.interface';
import { UserService } from '../user/services/user.service';
import { IJwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly jwtConfigService: JwtConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<Omit<IUser, 'password'> | null> {
    const user = await this.userService.findOne({
      email,
    });

    if (!user) {
      return null;
    }

    const isMatchPassword = await user.comparePassword(password);

    if (!isMatchPassword) {
      return null;
    }

    return omit(user, ['password']);
  }

  generateAuthToken(user: IUser) {
    const payload: IJwtPayload = user;

    const token = this.generateToken(payload, {
      expiresIn: `${this.jwtConfigService.authExpirationMinutes}m`,
      secret: this.jwtConfigService.secret,
    });

    return {
      authTokens: {
        accessToken: token,
      },
      user,
    };
  }

  private generateToken(payload: IJwtPayload, options: JwtSignOptions) {
    return this.jwtService.sign(payload, options);
  }
}

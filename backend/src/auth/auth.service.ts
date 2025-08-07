import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /**
   * Validates user credentials for login.
   * @param email User's email
   * @param pass User's plain text password
   * @returns User object if valid, null otherwise
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Destructure password out of the user object before returning
      const { ...result } = user;
      return result;
    }
    return null;
  }
  async login(loginDto: LoginDto) {
    const { credential, password } = loginDto;

    // Check whether the credential is an email (simple regex)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credential);

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: credential } : { userName: credential },
      include: {
        userInfo: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.userName,
        role: user.role,
        team: user.team,
        subteam: user.subteam,
        name: user.userInfo?.name || null,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      role = 'user',
      username,
      team,
      companyId,
      createdById,
    } = registerDto;

    // ✅ Check if email exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email is already registered.');
    }

    // ✅ Check if username exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { userName: username },
    });
    if (existingUsername) {
      throw new BadRequestException('Username is already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userCompanyId: string | null = null;

    if (role === 'admin') {
      if (companyId) {
        // ✅ Admin chooses to join an existing company
        const company = await this.prisma.company.findUnique({
          where: { id: companyId },
        });
        if (!company) {
          throw new NotFoundException('Company not found.');
        }
        userCompanyId = company.id;
      } else {
        // ✅ Admin can skip company — can create it later
        userCompanyId = null;
      }
    }

    if (role === 'user') {
      // 🔥 Users MUST link to a company
      if (!companyId) {
        throw new BadRequestException(
          'Company ID is required for user registration.',
        );
      }

      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found.');
      }

      userCompanyId = company.id;
    }

    // ✅ Create user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        team,
        userName: username,
        companyId: userCompanyId,
        createdById: createdById || null,
      },
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.userName,
        role: newUser.role,
        companyId: newUser.companyId,
        createdById: newUser.createdById,
      },
    };
  }
}

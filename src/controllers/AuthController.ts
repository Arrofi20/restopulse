import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { OwnerRepository } from '../repositories/OwnerRepository';
import { prisma } from '../lib/prisma';
import { ZodError } from 'zod';
import { registerSchema, loginSchema } from '../validation/auth.schema';

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  static getInstance(): AuthController {
    return new AuthController(new AuthService(new OwnerRepository()));
  }

  async register(req: Request, res: Response) {
    try {
      const { username, password } = registerSchema.parse(req.body);

      let outlet = await prisma.outlet.findFirst();
      if (!outlet) {
        outlet = await prisma.outlet.create({
          data: { name: 'Resto Utama', timezone: 'Asia/Jakarta' },
        });
      }

      const { owner, token } = await this.authService.register(
        username,
        password,
        outlet.id
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          owner: { id: owner.id, username: owner.username },
        },
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'REGISTER_ERROR', message: error.message },
        });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const { owner, token } = await this.authService.login(username, password);

      res.status(200).json({
        success: true,
        data: {
          token,
          owner: { id: owner.id, username: owner.username },
        },
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
        });
      } else {
        res.status(401).json({
          success: false,
          error: { code: 'LOGIN_ERROR', message: error.message },
        });
      }
    }
  }

  logout(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }
}

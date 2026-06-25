import bcrypt from 'bcrypt';
import { OwnerRepository } from '../repositories/OwnerRepository';
import { signToken } from '../lib/jwt';

export class AuthService {
  private ownerRepository: OwnerRepository;

  constructor(ownerRepository: OwnerRepository) {
    this.ownerRepository = ownerRepository;
  }

  async register(username: string, password: string, outletId: string) {
    const existing = await this.ownerRepository.findByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const owner = await this.ownerRepository.create({
      username,
      password_hash: passwordHash,
      outlet_id: outletId,
    });

    const token = signToken({ userId: owner.id, outletId: owner.outlet_id });
    return { owner, token };
  }

  async login(username: string, password: string) {
    const owner = await this.ownerRepository.findByUsername(username);
    if (!owner) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, owner.password_hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({ userId: owner.id, outletId: owner.outlet_id });
    return { owner, token };
  }

  logout() {
    return { success: true };
  }
}

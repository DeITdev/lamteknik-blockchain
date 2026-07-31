import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

export interface Tenant {
  id: number;
  nama: string;
  isActive: boolean;
  blockchainRegistered: boolean;
}

@Injectable()
export class TenantService {
  // In-memory tenant store (use database in production)
  private tenants: Map<number, Tenant> = new Map();

  constructor(private blockchainService: BlockchainService) {}

  async registerTenant(institusiId: number, nama: string): Promise<Tenant> {
    // Register on blockchain
    let blockchainRegistered = false;
    try {
      await this.blockchainService.registerTenant(institusiId, nama);
      blockchainRegistered = true;
    } catch (error) {
      console.error('Failed to register tenant on blockchain:', error);
    }

    const tenant: Tenant = {
      id: institusiId,
      nama,
      isActive: true,
      blockchainRegistered,
    };

    this.tenants.set(institusiId, tenant);
    return tenant;
  }

  async getTenant(institusiId: number): Promise<Tenant | undefined> {
    return this.tenants.get(institusiId);
  }

  async getAllTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  async updateTenant(
    institusiId: number,
    data: { nama?: string; isActive?: boolean },
  ): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(institusiId);
    if (!tenant) {
      return undefined;
    }
    if (data.nama !== undefined) {
      tenant.nama = data.nama;
    }
    if (data.isActive !== undefined) {
      tenant.isActive = data.isActive;
    }
    this.tenants.set(institusiId, tenant);
    return tenant;
  }

  async deactivateTenant(institusiId: number): Promise<boolean> {
    const tenant = this.tenants.get(institusiId);
    if (tenant) {
      tenant.isActive = false;
      return true;
    }
    return false;
  }
}

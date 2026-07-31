import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);
  private cachedSecret: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async getPrivateKey(): Promise<string | null> {
    if (this.cachedSecret) {
      return this.cachedSecret;
    }

    const vaultAddr = this.configService.get<string>('VAULT_ADDR');
    const vaultToken = this.configService.get<string>('VAULT_TOKEN');
    const vaultSecretPath = this.configService.get<string>('VAULT_SECRET_PATH');
    const secretKey = this.configService.get<string>('VAULT_SECRET_KEY', 'privateKey');

    if (!vaultAddr || !vaultToken || !vaultSecretPath) {
      this.logger.warn('Vault config is incomplete. Skipping Vault secret lookup.');
      return null;
    }

    const normalizedAddr = vaultAddr.endsWith('/') ? vaultAddr.slice(0, -1) : vaultAddr;
    const url = `${normalizedAddr}/v1/${vaultSecretPath}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Vault-Token': vaultToken,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Vault request failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as any;

    const candidates = [
      payload?.data?.data?.[secretKey],
      payload?.data?.[secretKey],
      payload?.data?.data?.privateKey,
      payload?.data?.privateKey,
      payload?.data?.data?.BLOCKCHAIN_PRIVATE_KEY,
      payload?.data?.BLOCKCHAIN_PRIVATE_KEY,
    ];

    const privateKey = candidates.find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    ) as string | undefined;

    if (!privateKey) {
      throw new Error(`Vault secret key not found for path ${vaultSecretPath}`);
    }

    this.cachedSecret = privateKey.trim();
    return this.cachedSecret;
  }
}

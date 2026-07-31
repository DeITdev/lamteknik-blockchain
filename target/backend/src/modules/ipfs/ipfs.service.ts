import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

// Note: ipfs-http-client uses ESM, this is a simplified implementation
// In production, use proper IPFS client or HTTP API directly

@Injectable()
export class IpfsService implements OnModuleInit {
  private readonly logger = new Logger(IpfsService.name);
  private apiUrl: string;
  private gatewayUrl: string;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get('IPFS_API_URL', 'http://localhost:5001');
    this.gatewayUrl = this.configService.get('IPFS_GATEWAY_URL', 'http://localhost:8080');
  }

  async onModuleInit() {
    await this.checkConnection();
  }

  /**
   * Check IPFS connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/id`, { method: 'POST' });
      if (response.ok) {
        const data = (await response.json()) as any;
        this.logger.log(`Connected to IPFS node: ${data.ID}`);
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to connect to IPFS:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check if connected
   */
  isIpfsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get IPFS node info
   */
  async getNodeInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/id`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to get node info');
      const id: any = await response.json();

      // Enrich with real repository statistics (size + object count).
      let repo: any = {};
      try {
        const repoRes = await fetch(`${this.apiUrl}/api/v0/repo/stat`, { method: 'POST' });
        if (repoRes.ok) repo = await repoRes.json();
      } catch {
        /* repo stat is best-effort */
      }

      return {
        ...id,
        RepoSize: repo.RepoSize ?? null,
        StorageMax: repo.StorageMax ?? null,
        NumObjects: repo.NumObjects ?? null,
      };
    } catch (error) {
      this.logger.error('Failed to get IPFS node info:', error);
      throw error;
    }
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(file: any): Promise<{
    ipfsHash: string;
    url: string;
    size: number;
    sha256: string;
  }> {
    try {
      // Create form data
      const formData = new FormData();
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      // Upload to IPFS
      const response = await fetch(`${this.apiUrl}/api/v0/add?pin=true`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = (await response.json()) as any;
      const ipfsHash = result.Hash;

      // Calculate SHA256
      const sha256 = createHash('sha256').update(file.buffer).digest('hex');

      this.logger.log(`File uploaded to IPFS: ${ipfsHash}`);

      return {
        ipfsHash,
        url: `${this.gatewayUrl}/ipfs/${ipfsHash}`,
        size: file.size,
        sha256,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJson(data: any): Promise<{
    ipfsHash: string;
    url: string;
  }> {
    try {
      const jsonString = JSON.stringify(data);
      const formData = new FormData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      formData.append('file', blob, 'data.json');

      const response = await fetch(`${this.apiUrl}/api/v0/add?pin=true`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = (await response.json()) as any;
      const ipfsHash = result.Hash;

      this.logger.log(`JSON uploaded to IPFS: ${ipfsHash}`);

      return {
        ipfsHash,
        url: `${this.gatewayUrl}/ipfs/${ipfsHash}`,
      };
    } catch (error) {
      this.logger.error('Failed to upload JSON to IPFS:', error);
      throw error;
    }
  }

  /**
   * Get file from IPFS
   */
  async getFile(ipfsHash: string): Promise<Buffer> {
    try {
      const response = await fetch(`${this.gatewayUrl}/ipfs/${ipfsHash}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get file from IPFS: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(`Failed to get file ${ipfsHash} from IPFS:`, error);
      throw error;
    }
  }

  /**
   * Get JSON from IPFS
   */
  async getJson(ipfsHash: string): Promise<any> {
    try {
      const response = await fetch(`${this.gatewayUrl}/ipfs/${ipfsHash}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get JSON from IPFS: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get JSON ${ipfsHash} from IPFS:`, error);
      throw error;
    }
  }

  /**
   * Pin file to IPFS
   */
  async pinFile(ipfsHash: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/pin/add?arg=${ipfsHash}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to pin file: ${response.statusText}`);
      }

      this.logger.log(`File pinned: ${ipfsHash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to pin file ${ipfsHash}:`, error);
      return false;
    }
  }

  /**
   * Unpin file from IPFS
   */
  async unpinFile(ipfsHash: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/pin/rm?arg=${ipfsHash}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to unpin file: ${response.statusText}`);
      }

      this.logger.log(`File unpinned: ${ipfsHash}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unpin file ${ipfsHash}:`, error);
      return false;
    }
  }

  /**
   * Get pinned files
   */
  async getPinnedFiles(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/v0/pin/ls`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to get pinned files: ${response.statusText}`);
      }

      const result = (await response.json()) as any;
      return Object.keys(result.Keys || {});
    } catch (error) {
      this.logger.error('Failed to get pinned files:', error);
      return [];
    }
  }

  /**
   * Get IPFS gateway URL for hash
   */
  getGatewayUrl(ipfsHash: string): string {
    return `${this.gatewayUrl}/ipfs/${ipfsHash}`;
  }

  /**
   * Verify file integrity
   */
  async verifyFileIntegrity(ipfsHash: string, expectedSha256: string): Promise<boolean> {
    try {
      const fileBuffer = await this.getFile(ipfsHash);
      const actualSha256 = createHash('sha256').update(fileBuffer).digest('hex');
      return actualSha256 === expectedSha256;
    } catch (error) {
      this.logger.error(`Failed to verify file integrity for ${ipfsHash}:`, error);
      return false;
    }
  }
}

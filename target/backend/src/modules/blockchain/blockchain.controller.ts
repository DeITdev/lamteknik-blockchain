import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get blockchain network info' })
  async getInfo() {
    return this.blockchainService.getBlockchainInfo();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get blockchain statistics' })
  async getStats() {
    const [info, totalAkreditasi] = await Promise.all([
      this.blockchainService.getBlockchainInfo(),
      this.blockchainService.getTotalAkreditasi(),
    ]);

    return {
      ...info,
      totalAkreditasi,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get recent real transactions from the node' })
  async getTransactions(@Query('limit') limit?: string) {
    const n = limit && !isNaN(Number(limit)) ? Number(limit) : 25;
    return this.blockchainService.getRecentTransactions(n);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Get deployed smart contract addresses' })
  getContracts() {
    return this.blockchainService.getContracts();
  }

  @Get('network-stats')
  @ApiOperation({ summary: 'Get real network statistics' })
  async getNetworkStats() {
    return this.blockchainService.getNetworkStats();
  }

  @Get('audit/all')
  @ApiOperation({ summary: 'Get audit info from blockchain' })
  async getAllAuditTrails() {
    try {
      const info = await this.blockchainService.getBlockchainInfo();
      return {
        info,
        note: 'Gunakan GET /blockchain/audit/{kodeAkreditasi} untuk mendapatkan audit trail spesifik',
        message: 'Audit trails tersimpan per akreditasi di blockchain',
      };
    } catch (error) {
      console.error('Error fetching audit info:', error);
      return { error: 'Failed to fetch audit info', info: null };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { AkreditasiService } from '../akreditasi/akreditasi.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly akreditasiService: AkreditasiService,
    private readonly blockchainService: BlockchainService,
  ) {}

  /**
   * Aggregate dashboard statistics from akreditasi DB + blockchain.
   */
  async getStats(tenantId: number) {
    const [akreditasiStats, blockchainInfo, totalOnChain] = await Promise.all([
      this.akreditasiService.getStats(tenantId),
      this.blockchainService.getBlockchainInfo().catch(() => ({ connected: false })),
      this.blockchainService.getTotalAkreditasi().catch(() => 0),
    ]);

    return {
      ...akreditasiStats,
      blockchain: {
        connected: blockchainInfo?.connected ?? false,
        chainId: blockchainInfo?.chainId,
        blockNumber: blockchainInfo?.blockNumber,
        totalAkreditasiOnChain: totalOnChain,
      },
    };
  }

  /**
   * Recent akreditasi activities (most recently created/updated records).
   */
  async getRecentActivities(tenantId: number, limit = 5) {
    const { data } = await this.akreditasiService.findAll(tenantId, { page: 1, limit });

    return data.map((a: any) => ({
      id: a.id,
      kodeAkreditasi: a.kodeAkreditasi,
      status: a.status,
      progress: a.progress,
      tipe: a.tipe,
      updatedAt: a.updatedAt ?? a.createdAt,
    }));
  }

  /**
   * Simple chart datasets derived from the stats aggregate.
   * type: 'status' (default) returns the workflow status distribution.
   */
  async getChartData(type: string, tenantId: number) {
    const stats = await this.akreditasiService.getStats(tenantId);

    if (type === 'status') {
      return {
        type,
        labels: ['Total', 'Berjalan', 'Selesai Bulan Ini', 'Menunggu Asesmen'],
        values: [
          stats.totalCount,
          stats.inProgressCount,
          stats.completedThisMonth,
          stats.waitingAssessment,
        ],
      };
    }

    return { type, labels: [], values: [] };
  }
}

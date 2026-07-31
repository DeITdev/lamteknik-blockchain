import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

// Kafka Topics for LAM Teknik System
export enum KafkaTopic {
  // CDC Topics from Debezium
  CDC_USERS = 'cdc-lamtek-users',
  CDC_AKREDITASI = 'cdc-lamtek-akreditasi',
  CDC_INSTITUSI = 'cdc-lamtek-institusi',

  // Normalized Data Pipeline Topics
  DATA_QUERY = 'lamtek.data.query',
  DATA_QUERY_SOFT_DELETE = 'lamtek.data.query.soft-delete',
  DATA_FILE = 'lamtek.data.file',

  // Blockchain Events
  BLOCKCHAIN_TRANSACTION = 'lamtek.blockchain.transaction',
  BLOCKCHAIN_BLOCK = 'lamtek.blockchain.block',
  BLOCKCHAIN_CONTRACT_EVENT = 'lamtek.blockchain.contract.event',
  
  // Akreditasi Events
  AKREDITASI_CREATED = 'lamtek.akreditasi.created',
  AKREDITASI_UPDATED = 'lamtek.akreditasi.updated',
  AKREDITASI_STATUS_CHANGED = 'lamtek.akreditasi.status.changed',
  
  // Asesmen Events
  ASESMEN_KECUKUPAN_COMPLETED = 'lamtek.asesmen.kecukupan.completed',
  ASESMEN_LAPANGAN_COMPLETED = 'lamtek.asesmen.lapangan.completed',
  ASESMEN_ASSIGNED = 'lamtek.asesmen.assigned',
  
  // Document Events
  DOCUMENT_UPLOADED = 'lamtek.document.uploaded',
  DOCUMENT_VERIFIED = 'lamtek.document.verified',
  DOCUMENT_IPFS_STORED = 'lamtek.document.ipfs.stored',
  
  // User Events
  USER_REGISTERED = 'lamtek.user.registered',
  USER_ACTIVATED = 'lamtek.user.activated',
  USER_DEACTIVATED = 'lamtek.user.deactivated',
  
  // Payment Events
  PAYMENT_CREATED = 'lamtek.payment.created',
  PAYMENT_COMPLETED = 'lamtek.payment.completed',
  PAYMENT_VERIFIED = 'lamtek.payment.verified',
  PAYMENT_REJECTED = 'lamtek.payment.rejected',
  
  // Notification Events
  NOTIFICATION_EMAIL = 'lamtek.notification.email',
  NOTIFICATION_PUSH = 'lamtek.notification.push',
  NOTIFICATION_SMS = 'lamtek.notification.sms',
  
  // Audit Events
  AUDIT_LOG = 'lamtek.audit.log',
}

export interface KafkaMessage<T = any> {
  topic: KafkaTopic;
  key?: string;
  value: T;
  timestamp?: Date;
  headers?: Record<string, string>;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private isConnected = false;

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      // Subscribe to response topics
      const responseTopics = [
        KafkaTopic.BLOCKCHAIN_TRANSACTION,
        KafkaTopic.BLOCKCHAIN_CONTRACT_EVENT,
        KafkaTopic.AKREDITASI_STATUS_CHANGED,
        KafkaTopic.DOCUMENT_VERIFIED,
        KafkaTopic.PAYMENT_COMPLETED,
      ];

      for (const topic of responseTopics) {
        this.kafkaClient.subscribeToResponseOf(topic);
      }

      await this.kafkaClient.connect();
      this.isConnected = true;
      this.logger.log('Kafka client connected successfully');
    } catch (error) {
      this.logger.warn(`Kafka connection failed: ${error.message}. Running without Kafka.`);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.kafkaClient.close();
      this.logger.log('Kafka client disconnected');
    }
  }

  /**
   * Runtime connection state, useful for conditional async workflows.
   */
  isKafkaConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Publish a message to a Kafka topic
   */
  async publish<T>(message: KafkaMessage<T>): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn(`Kafka not connected. Skipping message to ${message.topic}`);
      return;
    }

    try {
      const payload = {
        ...message.value,
        _metadata: {
          timestamp: message.timestamp || new Date(),
          source: 'lamtek-backend',
        },
      };

      this.kafkaClient.emit(message.topic, {
        key: message.key,
        value: JSON.stringify(payload),
        headers: message.headers,
      });

      this.logger.debug(`Published message to ${message.topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish to ${message.topic}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Publish normalized query/change events.
   */
  async publishDataQuery(data: Record<string, any>, key?: string): Promise<void> {
    await this.publish({
      topic: KafkaTopic.DATA_QUERY,
      key,
      value: data,
    });
  }

  /**
   * Publish normalized soft-delete events produced from CDC deletes.
   */
  async publishDataQuerySoftDelete(data: Record<string, any>, key?: string): Promise<void> {
    await this.publish({
      topic: KafkaTopic.DATA_QUERY_SOFT_DELETE,
      key,
      value: data,
    });
  }

  /**
   * Publish file workflow commands/events.
   */
  async publishDataFile(data: Record<string, any>, key?: string): Promise<void> {
    await this.publish({
      topic: KafkaTopic.DATA_FILE,
      key,
      value: data,
    });
  }

  /**
   * Send a message and wait for response
   */
  async send<T, R>(message: KafkaMessage<T>): Promise<R> {
    if (!this.isConnected) {
      throw new Error('Kafka client not connected');
    }

    return this.kafkaClient
      .send(message.topic, {
        key: message.key,
        value: JSON.stringify(message.value),
        headers: message.headers,
      })
      .toPromise();
  }

  // ============================================
  // Blockchain Event Publishers
  // ============================================

  async publishBlockchainTransaction(data: {
    txHash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    contractAddress?: string;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.BLOCKCHAIN_TRANSACTION,
      key: data.txHash,
      value: data,
    });
  }

  async publishContractEvent(data: {
    contractAddress: string;
    eventName: string;
    args: any;
    txHash: string;
    blockNumber: number;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.BLOCKCHAIN_CONTRACT_EVENT,
      key: data.txHash,
      value: data,
    });
  }

  // ============================================
  // Akreditasi Event Publishers
  // ============================================

  async publishAkreditasiCreated(data: {
    akreditasiId: number;
    institusiId: number;
    prodiId: number;
    tanggalPengajuan: Date;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.AKREDITASI_CREATED,
      key: String(data.akreditasiId),
      value: data,
    });
  }

  async publishAkreditasiStatusChanged(data: {
    akreditasiId: number;
    oldStatus: string;
    newStatus: string;
    changedBy: number;
    changedAt: Date;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.AKREDITASI_STATUS_CHANGED,
      key: String(data.akreditasiId),
      value: data,
    });
  }

  // ============================================
  // Document Event Publishers
  // ============================================

  async publishDocumentUploaded(data: {
    documentId: number;
    fileName: string;
    fileSize: number;
    akreditasiId: number;
    uploadedBy: number;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.DOCUMENT_UPLOADED,
      key: String(data.documentId),
      value: data,
    });
  }

  async publishDocumentIpfsStored(data: {
    documentId: number;
    ipfsHash: string;
    fileName: string;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.DOCUMENT_IPFS_STORED,
      key: data.ipfsHash,
      value: data,
    });
  }

  // ============================================
  // Payment Event Publishers
  // ============================================

  async publishPaymentCreated(data: {
    paymentId: number;
    akreditasiId: number;
    amount: number;
    dueDate: Date;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.PAYMENT_CREATED,
      key: String(data.paymentId),
      value: data,
    });
  }

  async publishPaymentCompleted(data: {
    paymentId: number;
    akreditasiId: number;
    amount: number;
    paidAt: Date;
    method: string;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.PAYMENT_COMPLETED,
      key: String(data.paymentId),
      value: data,
    });
  }

  // ============================================
  // User Event Publishers
  // ============================================

  async publishUserRegistered(data: {
    userId: number;
    email: string;
    role: string;
    registeredAt: Date;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.USER_REGISTERED,
      key: String(data.userId),
      value: data,
    });
  }

  // ============================================
  // Audit Event Publishers
  // ============================================

  async publishAuditLog(data: {
    action: string;
    entityType: string;
    entityId: number;
    userId: number;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.AUDIT_LOG,
      key: `${data.entityType}-${data.entityId}`,
      value: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  // ============================================
  // Notification Event Publishers
  // ============================================

  async sendEmailNotification(data: {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.NOTIFICATION_EMAIL,
      key: data.to,
      value: data,
    });
  }

  async sendPushNotification(data: {
    userId: number;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<void> {
    await this.publish({
      topic: KafkaTopic.NOTIFICATION_PUSH,
      key: String(data.userId),
      value: data,
    });
  }
}

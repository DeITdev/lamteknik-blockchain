import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { ConnectorService, DataFileEvent, DataQueryEvent } from './connector.service';
import { KafkaService, KafkaTopic } from './kafka.service';

@Controller()
export class KafkaController {
  private readonly logger = new Logger(KafkaController.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly connectorService: ConnectorService,
  ) {}

  // ============================================
  // CDC Ingestion (Debezium -> DataQuery)
  // ============================================

  @EventPattern(KafkaTopic.CDC_USERS)
  async handleCdcUsers(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    await this.handleCdcMessage(message, context);
  }

  @EventPattern(KafkaTopic.CDC_AKREDITASI)
  async handleCdcAkreditasi(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    await this.handleCdcMessage(message, context);
  }

  @EventPattern(KafkaTopic.CDC_INSTITUSI)
  async handleCdcInstitusi(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    await this.handleCdcMessage(message, context);
  }

  // ============================================
  // Connector Pipeline Consumers
  // ============================================

  @EventPattern(KafkaTopic.DATA_QUERY)
  async handleDataQuery(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const event = this.extractPayload(message) as DataQueryEvent;
      await this.connectorService.processDataQuery(event);
    } catch (error) {
      this.logger.error(`Error processing DATA_QUERY: ${error.message}`);
    }
  }

  @EventPattern(KafkaTopic.DATA_QUERY_SOFT_DELETE)
  async handleDataQuerySoftDelete(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const event = this.extractPayload(message) as DataQueryEvent;
      await this.connectorService.processDataQuery(event);
    } catch (error) {
      this.logger.error(`Error processing DATA_QUERY_SOFT_DELETE: ${error.message}`);
    }
  }

  @EventPattern(KafkaTopic.DATA_FILE)
  async handleDataFile(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const event = this.extractPayload(message) as DataFileEvent;
      await this.connectorService.processDataFile(event);
    } catch (error) {
      this.logger.error(`Error processing DATA_FILE: ${error.message}`);
    }
  }

  // ============================================
  // Blockchain Event Handlers
  // ============================================

  @EventPattern(KafkaTopic.BLOCKCHAIN_TRANSACTION)
  async handleBlockchainTransaction(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    this.logger.log(
      `Received blockchain transaction: topic=${topic}, partition=${partition}, offset=${offset}`,
    );

    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      this.logger.debug(`Transaction data: ${JSON.stringify(data)}`);
      
      // Process blockchain transaction
      // - Update local database
      // - Trigger notifications
      // - Update caches
    } catch (error) {
      this.logger.error(`Error processing blockchain transaction: ${error.message}`);
    }
  }

  @EventPattern(KafkaTopic.BLOCKCHAIN_CONTRACT_EVENT)
  async handleContractEvent(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log('Received contract event');
    
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      // Handle specific contract events
      switch (data.eventName) {
        case 'AkreditasiRegistered':
          await this.handleAkreditasiRegisteredEvent(data);
          break;
        case 'DocumentVerified':
          await this.handleDocumentVerifiedEvent(data);
          break;
        case 'AsesmenCompleted':
          await this.handleAsesmenCompletedEvent(data);
          break;
        default:
          this.logger.debug(`Unhandled contract event: ${data.eventName}`);
      }
    } catch (error) {
      this.logger.error(`Error processing contract event: ${error.message}`);
    }
  }

  // ============================================
  // Akreditasi Event Handlers
  // ============================================

  @EventPattern(KafkaTopic.AKREDITASI_STATUS_CHANGED)
  async handleAkreditasiStatusChanged(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log('Received akreditasi status change event');
    
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      // Notify relevant parties about status change
      // - Send email to institution
      // - Update dashboard
      // - Log to audit trail
      
      this.logger.log(
        `Akreditasi ${data.akreditasiId} status changed from ${data.oldStatus} to ${data.newStatus}`,
      );
    } catch (error) {
      this.logger.error(`Error processing status change: ${error.message}`);
    }
  }

  // ============================================
  // Document Event Handlers
  // ============================================

  @EventPattern(KafkaTopic.DOCUMENT_UPLOADED)
  async handleDocumentUploaded(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log('Received document uploaded event');
    
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      // Trigger document processing
      // - Store in IPFS
      // - Generate hash
      // - Register on blockchain
      
      this.logger.log(`Document ${data.documentId} uploaded by user ${data.uploadedBy}`);
    } catch (error) {
      this.logger.error(`Error processing document upload: ${error.message}`);
    }
  }

  @EventPattern(KafkaTopic.DOCUMENT_IPFS_STORED)
  async handleDocumentIpfsStored(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log('Received IPFS storage event');
    
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      // Update document record with IPFS hash
      // Register hash on blockchain for verification
      
      this.logger.log(`Document ${data.documentId} stored in IPFS: ${data.ipfsHash}`);
    } catch (error) {
      this.logger.error(`Error processing IPFS storage: ${error.message}`);
    }
  }

  // ============================================
  // Payment Event Handlers
  // ============================================

  @EventPattern(KafkaTopic.PAYMENT_COMPLETED)
  async handlePaymentCompleted(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log('Received payment completed event');
    
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      // Update akreditasi status
      // Send confirmation email
      // Generate receipt
      
      this.logger.log(
        `Payment ${data.paymentId} completed for akreditasi ${data.akreditasiId}`,
      );
    } catch (error) {
      this.logger.error(`Error processing payment completion: ${error.message}`);
    }
  }

  // ============================================
  // Audit Event Handlers
  // ============================================

  @EventPattern(KafkaTopic.AUDIT_LOG)
  async handleAuditLog(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : message;
      
      // Store audit log to database
      // Forward to monitoring system
      
      this.logger.debug(
        `Audit: ${data.action} on ${data.entityType}:${data.entityId} by user ${data.userId}`,
      );
    } catch (error) {
      this.logger.error(`Error processing audit log: ${error.message}`);
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async handleAkreditasiRegisteredEvent(data: any) {
    this.logger.log(`Akreditasi registered on blockchain: ${JSON.stringify(data.args)}`);
    // Update local database with blockchain confirmation
  }

  private async handleDocumentVerifiedEvent(data: any) {
    this.logger.log(`Document verified on blockchain: ${JSON.stringify(data.args)}`);
    // Update document verification status
  }

  private async handleAsesmenCompletedEvent(data: any) {
    this.logger.log(`Asesmen completed on blockchain: ${JSON.stringify(data.args)}`);
    // Update asesmen status and trigger next workflow step
  }

  private async handleCdcMessage(message: any, context: KafkaContext): Promise<void> {
    const topic = context.getTopic();
    const payload = this.extractPayload(message);
    const rawOp = this.getRawOperation(payload);

    if (!payload || !rawOp) {
      this.logger.warn(`Skipping CDC message from ${topic}: invalid Debezium payload`);
      return;
    }

    const table = String(topic).replace('cdc-lamtek-', '');
    const event = this.toDataQueryEvent(table, payload, rawOp, topic);

    if (event.operation === 'delete') {
      const softDeleteEvent: DataQueryEvent = {
        ...event,
        operation: 'soft_delete',
        after: this.createSoftDeleteProjection(event.before),
        metadata: {
          ...(event.metadata || {}),
          mappedFromDelete: true,
        },
      };

      await this.kafkaService.publishDataQuerySoftDelete(softDeleteEvent, softDeleteEvent.traceId);
      this.logger.log(`CDC delete mapped to soft_delete event: table=${table}, traceId=${softDeleteEvent.traceId}`);
      return;
    }

    await this.kafkaService.publishDataQuery(event, event.traceId);
    this.logger.debug(`CDC event normalized: table=${table}, op=${event.operation}, traceId=${event.traceId}`);
  }

  private extractPayload(message: any): any {
    const raw = message?.value ?? message;

    let parsed = raw;

    if (Buffer.isBuffer(parsed)) {
      parsed = parsed.toString('utf-8');
    }

    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    if (parsed?.payload && (parsed?.payload?.op || parsed?.payload?.before || parsed?.payload?.after)) {
      return parsed.payload;
    }

    return parsed;
  }

  private toDataQueryEvent(
    table: string,
    payload: any,
    rawOp: string,
    topic: string,
  ): DataQueryEvent {
    const tsMs = Number(payload.ts_ms || payload.__source_ts_ms || payload?.source?.ts_ms || Date.now());
    const { before, after } = this.extractBeforeAfter(payload, rawOp);

    return {
      source: 'debezium',
      database: payload?.source?.db || payload.__db,
      table,
      operation: this.mapOperation(rawOp),
      before,
      after,
      eventTime: new Date(tsMs).toISOString(),
      traceId: this.buildTraceId(topic, payload),
      metadata: {
        connector: payload?.source?.connector,
        sourceTsMs: payload?.source?.ts_ms,
        sourceFile: payload?.source?.file,
        sourcePos: payload?.source?.pos,
        row: payload?.source?.row,
      },
    };
  }

  private mapOperation(op: string): DataQueryEvent['operation'] {
    switch (op) {
      case 'c':
        return 'create';
      case 'u':
        return 'update';
      case 'd':
        return 'delete';
      case 'r':
        return 'snapshot';
      default:
        return 'update';
    }
  }

  private getRawOperation(payload: any): string | undefined {
    if (!payload) {
      return undefined;
    }

    if (typeof payload.op === 'string' && payload.op.length > 0) {
      return payload.op;
    }

    if (typeof payload.__op === 'string' && payload.__op.length > 0) {
      return payload.__op;
    }

    if (String(payload.__deleted).toLowerCase() === 'true') {
      return 'd';
    }

    return undefined;
  }

  private extractBeforeAfter(payload: any, rawOp: string): {
    before: Record<string, any> | null;
    after: Record<string, any> | null;
  } {
    if (payload && (payload.before !== undefined || payload.after !== undefined)) {
      return {
        before: payload.before || null,
        after: payload.after || null,
      };
    }

    const row = this.stripCdcMetadata(payload);

    if (rawOp === 'd') {
      return {
        before: row,
        after: null,
      };
    }

    return {
      before: null,
      after: row,
    };
  }

  private stripCdcMetadata(payload: any): Record<string, any> {
    const row: Record<string, any> = {};

    if (!payload || typeof payload !== 'object') {
      return row;
    }

    for (const [key, value] of Object.entries(payload)) {
      if (!key.startsWith('__')) {
        row[key] = value;
      }
    }

    return row;
  }

  private createSoftDeleteProjection(before: Record<string, any> | null | undefined): Record<string, any> {
    const deletedAt = new Date().toISOString();

    return {
      ...(before || {}),
      isDeleted: true,
      is_deleted: true,
      deletedAt,
      deleted_at: deletedAt,
    };
  }

  private buildTraceId(topic: string, payload: any): string {
    const source = payload?.source || {};
    const parts = [
      topic,
      source.file || payload?.__file || 'nofile',
      source.pos || payload?.__pos || '0',
      source.row || payload?.__row || '0',
      payload.ts_ms || payload?.__source_ts_ms || Date.now(),
    ];

    return parts.join(':');
  }
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('status_institusi')
export class TipeInstitusi {
  @ApiProperty({ description: 'ID tipe institusi' })
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ApiProperty({ description: 'Nama tipe institusi (PTN, PTS, Perusahaan, dll)' })
  @Column({ name: 'status_institusi', type: 'varchar', length: 255 })
  statusInstitusi: string;

  @ApiProperty({ description: 'Tanggal dibuat' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diupdate' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from '../entities/bank.entity';
import { CreateBankDto, UpdateBankDto } from '../dto/bank.dto';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async findAll(filters?: { isActive?: boolean }): Promise<Bank[]> {
    const queryBuilder = this.bankRepository.createQueryBuilder('bank');
    
    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('bank.isActive = :isActive', { isActive: filters.isActive });
    }
    
    return queryBuilder.orderBy('bank.namaBank', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Bank> {
    const bank = await this.bankRepository.findOne({ where: { id } });
    if (!bank) {
      throw new NotFoundException(`Bank dengan ID ${id} tidak ditemukan`);
    }
    return bank;
  }

  async create(createDto: CreateBankDto): Promise<Bank> {
    const existing = await this.bankRepository.findOne({ 
      where: { kodeBank: createDto.kodeBank } 
    });
    
    if (existing) {
      throw new ConflictException(`Bank dengan kode ${createDto.kodeBank} sudah ada`);
    }

    const bank = this.bankRepository.create(createDto);
    return this.bankRepository.save(bank);
  }

  async update(id: number, updateDto: UpdateBankDto): Promise<Bank> {
    const bank = await this.findOne(id);
    
    if (updateDto.kodeBank && updateDto.kodeBank !== bank.kodeBank) {
      const existing = await this.bankRepository.findOne({ 
        where: { kodeBank: updateDto.kodeBank } 
      });
      if (existing) {
        throw new ConflictException(`Bank dengan kode ${updateDto.kodeBank} sudah ada`);
      }
    }

    Object.assign(bank, updateDto);
    return this.bankRepository.save(bank);
  }

  async remove(id: number): Promise<void> {
    const bank = await this.findOne(id);
    await this.bankRepository.remove(bank);
  }

  async softDelete(id: number): Promise<Bank> {
    const bank = await this.findOne(id);
    bank.isActive = false;
    return this.bankRepository.save(bank);
  }
}

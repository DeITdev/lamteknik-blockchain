import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Validator, StatusValidator } from '../entities/validator.entity';
import { CreateValidatorDto, UpdateValidatorDto } from '../dto/validator.dto';

@Injectable()
export class ValidatorService {
  constructor(
    @InjectRepository(Validator)
    private readonly repository: Repository<Validator>,
  ) {}

  async findAll(filters?: {
    registrasiProdiBaruId?: number;
    validatorUserId?: number;
    status?: StatusValidator;
  }): Promise<Validator[]> {
    const query = this.repository.createQueryBuilder('validator');

    if (filters?.registrasiProdiBaruId) {
      query.andWhere('validator.registrasiProdiBaru = :registrasiProdiBaruId', { 
        registrasiProdiBaruId: filters.registrasiProdiBaruId 
      });
    }
    if (filters?.validatorUserId) {
      query.andWhere('validator.validatorUserId = :validatorUserId', { 
        validatorUserId: filters.validatorUserId 
      });
    }
    if (filters?.status) {
      query.andWhere('validator.status = :status', { status: filters.status });
    }

    query.orderBy('validator.createdAt', 'DESC');
    return query.getMany();
  }

  async findOne(id: number): Promise<Validator> {
    const validator = await this.repository.findOne({ where: { id } });
    if (!validator) {
      throw new NotFoundException(`Validator dengan ID ${id} tidak ditemukan`);
    }
    return validator;
  }

  async findByRegistrasi(registrasiProdiBaruId: number): Promise<Validator[]> {
    return this.repository.find({
      where: { registrasiProdiBaru: registrasiProdiBaruId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateValidatorDto): Promise<Validator> {
    const validator = this.repository.create(dto);
    return this.repository.save(validator);
  }

  async update(id: number, dto: UpdateValidatorDto): Promise<Validator> {
    const validator = await this.findOne(id);
    Object.assign(validator, dto);
    return this.repository.save(validator);
  }

  async remove(id: number): Promise<void> {
    const validator = await this.findOne(id);
    await this.repository.remove(validator);
  }

  async assign(id: number, userId: number): Promise<Validator> {
    const validator = await this.findOne(id);
    validator.status = StatusValidator.ASSIGNED;
    validator.tanggalPenugasan = new Date();
    validator.ditugaskanOleh = userId;
    return this.repository.save(validator);
  }

  async startValidation(id: number): Promise<Validator> {
    const validator = await this.findOne(id);
    validator.status = StatusValidator.IN_PROGRESS;
    return this.repository.save(validator);
  }

  async complete(id: number, hasilValidasi: string, isValid: boolean, rekomendasi: string): Promise<Validator> {
    const validator = await this.findOne(id);
    validator.status = StatusValidator.COMPLETED;
    validator.tanggalSelesai = new Date();
    validator.hasilValidasi = hasilValidasi;
    validator.isValid = isValid;
    validator.rekomendasi = rekomendasi;
    return this.repository.save(validator);
  }

  async findByValidator(validatorUserId: number): Promise<Validator[]> {
    return this.repository.find({
      where: { validatorUserId },
      order: { createdAt: 'DESC' },
    });
  }
}

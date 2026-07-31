import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  PenawaranAsesor,
  ResponAsesor,
  LaporanAsesmen,
  TanggapanAl,
  UmpanBalik,
  PengesahanAk,
  PengesahanAl,
  KeputusanMa,
  SinkronisasiBanpt,
  SkAkreditasi,
  Validator,
  RegistrasiProdiBaru,
  UmpanBalikAsesor,
  RegistrasiAkreditasi,
} from './entities';

// Services
import {
  PenawaranAsesorService,
  ResponAsesorService,
  LaporanAsesmenService,
  TanggapanAlService,
  UmpanBalikService,
  PengesahanAkService,
  PengesahanAlService,
  KeputusanMaService,
  SinkronisasiBanptService,
  SkAkreditasiService,
  ValidatorService,
  RegistrasiProdiBaruService,
} from './services';
import { UmpanBalikAsesorService } from './services/umpan-balik-asesor.service';
import { RegistrasiAkreditasiService } from './services/registrasi-akreditasi.service';

// Controllers
import {
  PenawaranAsesorController,
  ResponAsesorController,
  LaporanAsesmenController,
  TanggapanAlController,
  UmpanBalikController,
  PengesahanAkController,
  PengesahanAlController,
  KeputusanMaController,
  SinkronisasiBanptController,
  SkAkreditasiController,
  ValidatorController,
  RegistrasiProdiBaruController,
} from './controllers';
import { UmpanBalikAsesorController } from './controllers/umpan-balik-asesor.controller';
import { RegistrasiAkreditasiController } from './controllers/registrasi-akreditasi.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PenawaranAsesor,
      ResponAsesor,
      LaporanAsesmen,
      TanggapanAl,
      UmpanBalik,
      PengesahanAk,
      PengesahanAl,
      KeputusanMa,
      SinkronisasiBanpt,
      SkAkreditasi,
      Validator,
      RegistrasiProdiBaru,
      UmpanBalikAsesor,
      RegistrasiAkreditasi,
    ]),
  ],
  controllers: [
    PenawaranAsesorController,
    ResponAsesorController,
    LaporanAsesmenController,
    TanggapanAlController,
    UmpanBalikController,
    PengesahanAkController,
    PengesahanAlController,
    KeputusanMaController,
    SinkronisasiBanptController,
    SkAkreditasiController,
    ValidatorController,
    RegistrasiProdiBaruController,
    UmpanBalikAsesorController,
    RegistrasiAkreditasiController,
  ],
  providers: [
    PenawaranAsesorService,
    ResponAsesorService,
    LaporanAsesmenService,
    TanggapanAlService,
    UmpanBalikService,
    PengesahanAkService,
    PengesahanAlService,
    KeputusanMaService,
    SinkronisasiBanptService,
    SkAkreditasiService,
    ValidatorService,
    RegistrasiProdiBaruService,
    UmpanBalikAsesorService,
    RegistrasiAkreditasiService,
  ],
  exports: [
    PenawaranAsesorService,
    ResponAsesorService,
    LaporanAsesmenService,
    TanggapanAlService,
    UmpanBalikService,
    PengesahanAkService,
    PengesahanAlService,
    KeputusanMaService,
    SinkronisasiBanptService,
    SkAkreditasiService,
    ValidatorService,
    RegistrasiProdiBaruService,
    UmpanBalikAsesorService,
    RegistrasiAkreditasiService,
  ],
})
export class ProsesAkreditasiModule {}

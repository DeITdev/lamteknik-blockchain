import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { DokumenService, TipeDokumen } from './dokumen.service';

@ApiTags('dokumen')
@Controller('dokumen')
export class DokumenController {
  constructor(private readonly service: DokumenService) {}

  @Get()
  @ApiOperation({ summary: 'Get semua dokumen' })
  async getAllDokumen() {
    return this.service.getAllDokumen();
  }

  @Get('akreditasi/:kodeAkreditasi')
  @ApiOperation({ summary: 'Get semua dokumen untuk akreditasi' })
  async getDokumenByAkreditasi(@Param('kodeAkreditasi') kodeAkreditasi: string) {
    return this.service.getDokumenByAkreditasi(kodeAkreditasi);
  }

  @Get('ipfs/:hash')
  @ApiOperation({ summary: 'Download dokumen dari IPFS' })
  async getDokumen(@Param('hash') hash: string, @Res() res: Response) {
    try {
      const buffer = await this.service.getDokumenFromIpfs(hash);
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Document not found' });
    }
  }

  @Post('upload/:kodeAkreditasi')
  @ApiOperation({ summary: 'Upload dokumen ke IPFS dan blockchain' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDokumen(
    @Param('kodeAkreditasi') kodeAkreditasi: string,
    @UploadedFile() file: any,
    @Body('tipeDokumen') tipeDokumen: TipeDokumen,
    @Body('metadata') metadata?: string,
  ) {
    const parsedMetadata = metadata ? JSON.parse(metadata) : undefined;
    return this.service.uploadDokumen(kodeAkreditasi, file, tipeDokumen, parsedMetadata);
  }

  @Post('verify/:hash')
  @ApiOperation({ summary: 'Verifikasi integritas dokumen' })
  async verifyDokumen(
    @Param('hash') hash: string,
    @Body('sha256') sha256: string,
  ) {
    return this.service.verifyDokumen(hash, sha256);
  }
}

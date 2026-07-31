import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';

@ApiTags('ipfs')
@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get IPFS node info' })
  async getInfo() {
    const connected = this.ipfsService.isIpfsConnected();
    if (!connected) {
      return { connected: false };
    }

    const nodeInfo = await this.ipfsService.getNodeInfo();
    return {
      connected: true,
      ...nodeInfo,
    };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file to IPFS' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    return this.ipfsService.uploadFile(file);
  }

  @Post('upload-json')
  @ApiOperation({ summary: 'Upload JSON data to IPFS' })
  async uploadJson(@Body() data: any) {
    return this.ipfsService.uploadJson(data);
  }

  @Get('file/:hash')
  @ApiOperation({ summary: 'Get file from IPFS' })
  @ApiResponse({ status: HttpStatus.OK, description: 'File content' })
  async getFile(@Param('hash') hash: string, @Res() res: Response) {
    try {
      const buffer = await this.ipfsService.getFile(hash);
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.NOT_FOUND).json({ error: 'File not found' });
    }
  }

  @Get('json/:hash')
  @ApiOperation({ summary: 'Get JSON from IPFS' })
  async getJson(@Param('hash') hash: string) {
    return this.ipfsService.getJson(hash);
  }

  @Post('pin/:hash')
  @ApiOperation({ summary: 'Pin file to IPFS' })
  async pinFile(@Param('hash') hash: string) {
    const success = await this.ipfsService.pinFile(hash);
    return { success, hash };
  }

  @Post('unpin/:hash')
  @ApiOperation({ summary: 'Unpin file from IPFS' })
  async unpinFile(@Param('hash') hash: string) {
    const success = await this.ipfsService.unpinFile(hash);
    return { success, hash };
  }

  @Get('pinned')
  @ApiOperation({ summary: 'Get list of pinned files' })
  async getPinnedFiles() {
    const files = await this.ipfsService.getPinnedFiles();
    return { count: files.length, files };
  }

  @Post('verify/:hash')
  @ApiOperation({ summary: 'Verify file integrity' })
  async verifyIntegrity(
    @Param('hash') hash: string,
    @Body('sha256') sha256: string,
  ) {
    const valid = await this.ipfsService.verifyFileIntegrity(hash, sha256);
    return { hash, sha256, valid };
  }
}

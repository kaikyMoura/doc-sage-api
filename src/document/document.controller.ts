import {
  BadRequestException,
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { CreateFileSchemaDto } from 'src/file-schemas/dtos/create-file-schema.dto';

@ApiTags('Document')
@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('process')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a file and extract its text' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document to process',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async processFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body('schema') schema: CreateFileSchemaDto,
    @Body('formatTo') formatTo: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const text = await this.documentService.extractTextFromFIle(file);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.documentService.processFile(text, formatTo, schema);
  }
}

import { Response } from 'express';
import {
  BadRequestException,
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Res,
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
    @Res() res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body('schema') schema?: CreateFileSchemaDto,
    @Body('output') output: string = 'json',
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const text = await this.documentService.extractTextFromFIle(file);

    const processedFileResponse = await this.documentService.processFile(
      text,
      output,
      schema,
    );

    if (output === 'md') {
      res.header('Content-Type', 'text/markdown; charset=utf-8');
      // If the output format is markdown, convert the JSON object to a markdown list
      return res
        .status(200)
        .send(this.documentService.jsonToMarkdownList(processedFileResponse));
    }

    // If the output format is not markdown, return the JSON object
    return res.status(200).send(processedFileResponse);
  }
}

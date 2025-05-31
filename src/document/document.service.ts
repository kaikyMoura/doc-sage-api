import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'multer';
import { extname } from 'path';
import { askLLM } from 'src/utils/llm.service';
import { extractTextFromImage } from 'src/utils/ocr.service';
import { extractTextFromPDF } from 'src/utils/pdf.service';
import { v4 as uuidv4 } from 'uuid';
import { DocumentResponseDto } from './dtos/document-response.dto';

@Injectable()
export class DocumentService {
  /**
   * Extracts text from an image or PDF and asks an LLM to summarize it.
   *
   * @param file - The file to process.
   * @returns An object containing the text extracted from the file and the LLM's response.
   * @throws UnsupportedMediaTypeException if the file type is not supported.
   *
   * @example
   * const response = await this.documentService.processFile(file);
   */
  async processFile(file: Express.Multer.File): Promise<DocumentResponseDto> {
    const ext = extname(file.originalname).toLowerCase();
    let text = '';

    if (ext === '.pdf') {
      text = await extractTextFromPDF(file.path);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      text = await extractTextFromImage(file.path);
    } else {
      throw new UnsupportedMediaTypeException('Unsupported file type');
    }

    const response = await askLLM(text);
    const dto = plainToInstance(DocumentResponseDto, response);

    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new Error('The LLM response is invalid: ' + JSON.stringify(errors));
    }

    return {
      id: uuidv4(),
      parts_involved: dto.parts_involved,
      signature_data: dto.signature_data,
      contract_value: dto.contract_value,
      clause_fine: dto.clause_fine,
      clause_prize: dto.clause_prize,
      clause_duration: dto.clause_duration,
      created_at: dto.created_at,
    };
  }
}

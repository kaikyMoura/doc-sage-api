import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';

@Injectable()
export class PDFService {
  /**
   * Extracts text from a PDF file.
   * @param filePath The path to the PDF file to process.
   * @returns The extracted text.
   * @throws If the file does not exist.
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
}

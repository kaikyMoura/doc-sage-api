import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: File) {
    if (!value) return false;

    const oneKb = 1000;
    return value.size < oneKb;
  }
}

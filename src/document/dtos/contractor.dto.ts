import { IsString } from 'class-validator';

export class ContractorDto {
  @IsString()
  name: string;

  @IsString()
  identifier: string;
}

import { IsOptional, IsString } from 'class-validator';

export class ContractedDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  identifier?: string;
}

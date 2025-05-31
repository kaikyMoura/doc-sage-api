import { IsOptional, IsString } from 'class-validator';

export class SignatureDto {
  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsString()
  date: string;
}

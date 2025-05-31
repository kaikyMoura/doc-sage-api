import { IsOptional, IsString } from 'class-validator';

export class ClauseFineDto {
  @IsOptional()
  @IsString()
  clause?: string;

  @IsString()
  value: string;
}

import { IsOptional, IsString } from 'class-validator';

export class ClausePrizeDto {
  @IsOptional()
  @IsString()
  clause?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  details?: string;
}

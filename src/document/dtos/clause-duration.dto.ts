import { IsOptional, IsString } from 'class-validator';

export class ClauseDurationDto {
  @IsOptional()
  @IsString()
  clause?: string;

  @IsString()
  duration: string;

  @IsString()
  start_date: string;
}

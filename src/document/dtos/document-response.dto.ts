import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PartsInvolvedDto } from '././parts-involved.dto';
import { ClauseDurationDto } from './clause-duration.dto';
import { ClauseFineDto } from './clause-fine.dto';
import { ClausePrizeDto } from './clause-prize.dto';
import { ContractValueDto } from './contract-value.dto';
import { SignatureDto } from './signature.dto';

export class DocumentResponseDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @ValidateNested()
  @Type(() => PartsInvolvedDto)
  parts_involved: PartsInvolvedDto;

  @ValidateNested()
  @Type(() => ContractValueDto)
  contract_value: ContractValueDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SignatureDto)
  signature_data: SignatureDto[];

  @ValidateNested()
  @Type(() => ClauseFineDto)
  clause_fine: ClauseFineDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClausePrizeDto)
  clause_prize?: ClausePrizeDto;

  @ValidateNested()
  @Type(() => ClauseDurationDto)
  clause_duration: ClauseDurationDto;

  @IsString()
  created_at: string;
}

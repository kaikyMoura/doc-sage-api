import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ContractedDto } from './contracted.dto';
import { ContractorDto } from './contractor.dto';

export class PartsInvolvedDto {
  @ValidateNested()
  @Type(() => ContractorDto)
  contractor: ContractorDto;

  @ValidateNested()
  @Type(() => ContractedDto)
  contracted: ContractedDto;
}

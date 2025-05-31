import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { PaymentScheduleDto } from './payment-schedule.dto';

export class ContractValueDto {
  @IsString()
  value: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentScheduleDto)
  payment_schedule: PaymentScheduleDto[];
}

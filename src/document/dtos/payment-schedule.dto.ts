import { IsString } from 'class-validator';

export class PaymentScheduleDto {
  @IsString()
  percentage: string;

  @IsString()
  payment_due: string;
}

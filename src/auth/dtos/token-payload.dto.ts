import { IsString, IsUUID } from 'class-validator';

export class TokenPayloadDto {
  @IsUUID()
  sub: string;

  @IsString()
  name?: string;

  @IsString()
  email: string;
}

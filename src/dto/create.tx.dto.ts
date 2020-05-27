import { IsString, IsInt, Length } from 'class-validator';

export class CreateTxDto {
  @IsInt()
  readonly height: number;

  @IsString()
  readonly hash: string;

  @Length(10, 20)
  readonly memo: string;
}
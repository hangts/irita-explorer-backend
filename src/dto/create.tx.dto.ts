import { IsString, IsInt, Length } from 'class-validator';

//一般情况下, 非Base dto需要继承 Base dto, demo里随便写一些字段

export class CreateTxDto {
  @IsInt()
  readonly height: number;

  @IsString()
  readonly hash: string;

  @Length(10, 20)
  readonly memo: string;
}
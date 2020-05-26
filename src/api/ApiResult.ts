import {ErrorCodes} from './ResultCodes';
import { HttpException } from '@nestjs/common';
import {IResultBase} from '../types';


export class Result<T> implements IResultBase{
  public code: number = ErrorCodes.success;
  public data: T;

  constructor(data: T, code: number = ErrorCodes.success){
    this.data = data;
    this.code = code;
  }
}
// node process will exit when javascript engine throw an Error obj, which
// we should throw an httpException obj
export class ApiError extends Error{
  public code: number = ErrorCodes.failed;

  constructor(message: string, code: number = ErrorCodes.failed){
    super(message);
    this.code = code;
  }
}
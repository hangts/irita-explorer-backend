import {ErrorCodes} from './ResultCodes';
import { HttpException } from '@nestjs/common';

export interface ResultBase {
  code: number;
  data?: any;
  message?: string;
}

export class Result<T> implements ResultBase{
  public code: number = ErrorCodes.success;
  public data: T;

  constructor(data: T, code: number = ErrorCodes.success){
    this.data = data;
    this.code = code;
  }
}

export class ApiError extends HttpException{
  public code: number = ErrorCodes.failed;

  constructor(message: string, code: number = ErrorCodes.failed){
    super(message,403);
    //Object.setPrototypeOf(this, FooError.prototype);
    this.code = code;
  }
}
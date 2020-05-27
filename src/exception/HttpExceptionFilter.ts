import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import {ErrorCodes} from '../api/ResultCodes';
import {ResultCodesMaps} from '../api/ResultCodes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        console.error(`there is an error from ${request.url}`, exception);
        let code: number = ErrorCodes.failed, message: string = ResultCodesMaps.get(ErrorCodes.failed);
        if(exception.response && exception.response.code && exception.response.message){
            code = exception.response.code;
            message = exception.response.message;
        }
        response
            .status(200)
            .json({
                code,
                message,
            });
    }
}
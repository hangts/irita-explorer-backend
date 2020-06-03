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
        let code: number = exception.code, message: string = ResultCodesMaps.get(exception.code) || exception.errmsg;
        if(exception.response && exception.response.code){
            code = exception.response.code;
            message = exception.response.message || (ResultCodesMaps.get(code) || '');
        }
        response
            .status(200)
            .json({
                code,
                message,
            });
    }
}
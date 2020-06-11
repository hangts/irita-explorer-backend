import { ExceptionFilter, Catch, ArgumentsHost, Logger} from '@nestjs/common';
import {ErrorCodes} from '../api/ResultCodes';
import {ResultCodesMaps} from '../api/ResultCodes';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        console.error(`there is an error from ${request.url}`, exception);
        let code: number = exception.code || ErrorCodes.failed, message: string = ResultCodesMaps.get(exception.code) || (exception.errmsg || exception.message);
        if(exception.response && exception.response.code){
            code = exception.response.code;
            message = exception.response.message || (ResultCodesMaps.get(code) || '');
            new Logger().log('error:',JSON.stringify({code:code, message:message}));
        }
        response
            .status(200)
            .json({
                code,
                message,
            });
    }
}
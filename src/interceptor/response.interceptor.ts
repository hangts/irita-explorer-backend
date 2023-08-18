import {CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {TxService} from "../service/tx.service";
import {cfg} from "../config/config";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(
        @Inject("TxService") private readonly txService: TxService,
    ) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(async data => {
                if (cfg.wnsIsOpen === 'true') {
                    data.data.domain_address = await this.txService.getDomainAddress(data, "", "");
                }
                return data
            }),
        );
    }
}

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
                let domainAddress;
                if (cfg.wnsIsOpen === 'true') {
                    domainAddress = await this.txService.getDomainAddress(data, "", "");
                }
                let responseData;
                if (data.data && data.data.data) {
                    responseData = data.data.data
                } else if (data.data && data.data?.count !=0 && data?.count != 0) {
                    responseData = data.data
                }else {
                    responseData = {}
                }

                const count = (data.data?.count || data.data?.count == 0) ? data.data.count : data.count


                return {
                    code: data.code,
                    data: {
                        data: responseData,
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        domain_address: domainAddress,
                        count: count,
                    },
                }
            }),
        );
    }
}

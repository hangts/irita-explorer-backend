import {CacheInterceptor, ExecutionContext, Injectable} from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const {httpAdapter} = this.httpAdapterHost;

    const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
    const excludePaths = [
      // because this api can occur deep_clone error. See:https://github.com/Automattic/mongoose/issues/6507
      '/txs/services',
      '/txs/identity',
      '/txs/ddc',
      '/txs/asset',
      '/txs/addresses',
      '/e',
      '/txs',
      '/identities'
      // Routes to be excluded
    ];

    let skip = false
    for (const p of excludePaths) {
      skip = httpAdapter.getRequestUrl(request).includes(p)
      if (skip) {
        break
      }
    }
    if (
      !isGetRequest ||
      (isGetRequest && skip)) {
      return undefined;
    }
    return httpAdapter.getRequestUrl(request);
  }
}
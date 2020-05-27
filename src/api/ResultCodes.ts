export enum ErrorCodes {
    failed = -1,
    success = 0,
    unauthorization = 401,
    InvalidRequest = 10001,//custom error code
}


/**
 *
 *  key:       error code
 *  value:     description
 *
 * */

export const ResultCodesMaps = new Map<number, string>([
    [ErrorCodes.failed, 'failed'],
    [ErrorCodes.success, 'success'],
    [ErrorCodes.unauthorization, 'you have no permission to access'],
    [ErrorCodes.InvalidRequest, 'InvalidRequest'],
]);
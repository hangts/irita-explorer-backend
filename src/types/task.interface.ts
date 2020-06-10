export interface TaskCallback {
    (): Promise<boolean>;
}
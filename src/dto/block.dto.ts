
export class BlockDto {
    height: number;
    hash: string;
    txn: number;
    time: string;

    constructor(height: number, hash: string, txn: number, time: string) {
        this.height = height;
        this.hash = hash;
        this.txn = txn;
        this.time = time;
    }

    setHeight(height: number) {
        this.height = height;
    }

    getHeight(): number {
        return this.height;
    }

    setHash(hash: string) {
        this.hash = hash;
    }

    getHash(): string {
        return this.hash;
    }

    setTxn(txn: number) {
        this.txn = txn;
    }

    getTxn(): number {
        return this.txn;
    }

    setTime(time: string) {
        this.time = time;
    }

    getTime(): string {
        return this.time;
    }


}
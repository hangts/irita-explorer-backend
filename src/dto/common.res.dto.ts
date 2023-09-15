export class Coin {
    denom: string;
    amount: string;
    constructor(value) {
        let { denom, amount } = value;
        this.denom = denom || '';
        this.amount = amount || '';
    }

    static bundleData(value: any = []): Coin[] {
        let data: Coin[] = [];
        data = value.map((v: any) => {
            return new Coin(v);
        });
        return data;
    }
}


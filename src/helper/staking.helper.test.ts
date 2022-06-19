import {globalAccountNumber} from "../helper/staking.helper";

describe('SDK API', () => {
  it('globalAccountNumber', async () => {
    // jest.setTimeout(1000000)
    const data = await globalAccountNumber();
    console.log("=====>globalAccountNumber:",data?.globalAccountNumber)
  });
})
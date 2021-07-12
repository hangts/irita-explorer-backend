import { Test } from '@nestjs/testing';
import { TokenService } from './token.service';
import { AppModule } from './../app.module';
        
describe('TokenService', () => {
    let tokenService: TokenService;
    const Itoken = {
      denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      chain: 'iris',
      key: '66bc60f8251ac60e2baca8afe7f69b8d'
    }
    const tracesTokensData = {
      "denom_trace": {
        "path": "transfer/channel-0",
        "base_denom": "uatom"
      }
    }

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
          }).compile();
        tokenService = module.get<TokenService>(TokenService);
    });

    describe('doQueryIbcToken', () => {
        it('query Ibc token', async () => {
          tokenService.doQueryIbcToken(Itoken);
        });
    });

    describe('doInsertIbcToken', () => {
      it('insert Ibc token', async () => {
        tokenService.doInsertIbcToken(tracesTokensData, Itoken);
      });
  });
});


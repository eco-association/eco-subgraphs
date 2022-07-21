import { Address, BigInt } from "@graphprotocol/graph-ts/index";
import { Token as TokenSchema } from "../../../generated/schema";
import { ERC20 } from "../../../generated/ECO/ERC20";

export class Token {
    public readonly token: TokenSchema;

    static load(id: string, address: Address): Token {
        return new Token(id, address);
    }

    constructor(id: string, address: Address) {
        let token = TokenSchema.load(id);
        if (!token) {
            const tokenContract = ERC20.bind(address);
            token = new TokenSchema(id);
            token.name = tokenContract.name();
            token.symbol = tokenContract.symbol();
            token.decimals = tokenContract.decimals();
            token.totalSupply = BigInt.fromString("0");
        }
        this.token = token;
    }

    increaseSupply(amount: BigInt): void {
        this.token.totalSupply = this.token.totalSupply.plus(amount);
        this.token.save();
    }

    decreaseSupply(amount: BigInt): void {
        this.token.totalSupply = this.token.totalSupply.minus(amount);
        this.token.save();
    }
}

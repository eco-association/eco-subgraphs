import { Address, BigInt, log, Value } from "@graphprotocol/graph-ts/index";
import { Account, TokenDelegate } from "../../../generated/schema";
import { loadOrCreateAccount } from "../index";

export class DelegatedVotesManager {
    public static getId(
        token: string,
        delegator: Address,
        delegatee: Address,
        index: i32
    ): string {
        return `${token}-${delegator.toHexString()}-${delegatee.toHexString()}-${index.toString()}`;
    }

    private static getAccountTokenIndexField(token: string): string {
        if (token == "sEcox") return "stakedEcoXDelegateIndex";
        return "ecoDelegateIndex";
    }

    private static getAccountDelegateTypeField(token: string): string {
        if (token == "sEcox") return "stakedEcoXDelegationType";
        return "ecoDelegationType";
    }

    private static getTokenIndex(token: string, account: Account): i32 {
        const indexField =
            DelegatedVotesManager.getAccountTokenIndexField(token);
        return account.get(indexField)!.toI32();
    }

    private readonly token: string;

    private readonly delegator: Address;

    private readonly delegatee: Address;

    private readonly account: Account;

    private readonly lastTokenDelegate: TokenDelegate | null;

    private tokenDelegate: TokenDelegate | null = null;

    constructor(token: string, delegator: Address, delegatee: Address) {
        this.token = token;
        this.delegator = delegator;
        this.delegatee = delegatee;
        this.account = loadOrCreateAccount(delegator);

        const lastTokenDelegate = TokenDelegate.load(
            DelegatedVotesManager.getId(
                this.token,
                this.delegator,
                this.delegatee,
                DelegatedVotesManager.getTokenIndex(this.token, this.account)
            )
        );

        if (lastTokenDelegate && !lastTokenDelegate.blockEnded) {
            this.lastTokenDelegate = lastTokenDelegate;
        }
    }

    delegatePrimary(amount: BigInt, blockNumber: BigInt): void {
        this.delegate(amount, blockNumber);
        this.setAccountDelegateType("Primary");
    }

    delegateAmount(amount: BigInt, blockNumber: BigInt): void {
        this.delegate(amount, blockNumber);
        this.setAccountDelegateType("Amount");
    }

    undelegateAmount(amount: BigInt, blockNumber: BigInt): void {
        this.undelegate(amount, blockNumber);
    }

    private delegate(amount: BigInt, blockNumber: BigInt): void {
        const prevAmount = this.getPrevAmount();
        const totalAmount = amount.plus(prevAmount);

        this.createEntity(totalAmount, blockNumber);
    }

    private undelegate(amount: BigInt, blockNumber: BigInt): void {
        const prevAmount = this.getPrevAmount();
        const totalAmount = prevAmount.plus(amount);

        if (!totalAmount.isZero()) {
            this.createEntity(totalAmount, blockNumber);
        } else if (this.lastTokenDelegate) {
            this.lastTokenDelegate.blockEnded = blockNumber;
            this.setAccountDelegateType("None");
        } else {
            log.error(
                "Undelegate Amount did not update any TokenDelegate entity",
                []
            );
        }
    }

    save(): void {
        if (this.account) this.account.save();
        if (this.tokenDelegate) this.tokenDelegate!.save();
        if (this.lastTokenDelegate) this.lastTokenDelegate!.save();
    }

    private createEntity(amount: BigInt, blockStarted: BigInt): void {
        const indexField = DelegatedVotesManager.getAccountTokenIndexField(
            this.token
        );
        const index = this.account.get(indexField)!.toI32();

        const tokenDelegate = new TokenDelegate(
            DelegatedVotesManager.getId(
                this.token,
                this.delegator,
                this.delegatee,
                index
            )
        );

        tokenDelegate.token = this.token;
        tokenDelegate.amount = amount;
        tokenDelegate.blockStarted = blockStarted;
        tokenDelegate.delegator = this.delegator.toHexString();
        tokenDelegate.delegatee = this.delegatee.toHexString();

        this.tokenDelegate = tokenDelegate;

        const newIndex = index + 1;
        this.account.set(indexField, Value.fromI32(newIndex));
    }

    private setAccountDelegateType(type: string): void {
        this.account.set(
            DelegatedVotesManager.getAccountDelegateTypeField(this.token),
            Value.fromString(type)
        );
    }

    private getPrevAmount(): BigInt {
        if (!this.lastTokenDelegate) return BigInt.zero();
        return this.lastTokenDelegate!.amount;
    }
}

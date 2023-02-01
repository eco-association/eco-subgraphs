import {
    Address,
    BigInt,
    Bytes,
    log,
    store,
    Value,
} from "@graphprotocol/graph-ts/index";
import { ethereum } from "@graphprotocol/graph-ts";
import {
    Account,
    TokenDelegate,
    TokenDelegateManager,
} from "../../../generated/schema";
import { loadOrCreateAccount } from "../index";

import { ECO } from "../../../generated/ECO/ECO";
import { ECOxStaking } from "../../../generated/ECOxStaking/ECOxStaking";

export class DelegatedVotesManager {
    public static ECO: string = "eco";

    public static STAKED_ECO_X: string = "sEcox";

    public static ACCOUNT_DELEGATE_TYPE_NONE: string = "None";

    public static ACCOUNT_DELEGATE_TYPE_AMOUNT: string = "Amount";

    public static ACCOUNT_DELEGATE_TYPE_PRIMARY: string = "Primary";

    public static NEW_PRIMARY_DELEGATE_EVENT_SIG: string =
        "0x88a6f95a94556f83d3752aaa691040ea5c04d9db823566be9f2f325eb866c9ae";

    public static UPDATE_VOTES_EVENT_SIG: string =
        "0xd1b0c5e03e405cea97403894c17af4610d6d851ffe4baa03de1ca5e7c700cd75";

    public static getId(
        token: string,
        delegator: Address,
        delegatee: Address,
        index: i32
    ): string {
        return `${token}-${delegator.toHexString()}-${delegatee.toHexString()}-${index.toString()}`;
    }

    public static getManagerId(
        token: string,
        delegator: Address,
        delegatee: Address
    ): string {
        return `${token}-${delegator.toHexString()}-${delegatee.toHexString()}`;
    }

    private static getAccountDelegateeField(
        token: string,
        account: Account
    ): string | null {
        if (token == DelegatedVotesManager.STAKED_ECO_X)
            return account.sECOxDelegator;
        return account.ECODelegator;
    }

    private static getAccountDelegateTypeField(token: string): string {
        if (token == DelegatedVotesManager.STAKED_ECO_X)
            return "stakedEcoXDelegationType";
        return "ecoDelegationType";
    }

    private static loadOrCreateManager(
        token: string,
        delegator: Address,
        delegatee: Address
    ): TokenDelegateManager {
        const id = DelegatedVotesManager.getManagerId(
            token,
            delegator,
            delegatee
        );
        let manager = TokenDelegateManager.load(id);
        if (!manager) {
            manager = new TokenDelegateManager(id);
            manager.index = 0;
            manager.token = token;
            manager.delegator = delegator.toHexString();
            manager.delegatee = delegatee.toHexString();
            manager.save();
        }
        return manager;
    }

    private readonly token: string;

    private readonly delegator: Address;

    private readonly delegatee: Address;

    private readonly account: Account;

    private readonly manager: TokenDelegateManager;

    public readonly lastTokenDelegate: TokenDelegate | null;

    private tokenDelegate: TokenDelegate | null = null;

    constructor(token: string, delegator: Address, delegatee: Address) {
        this.token = token;
        this.delegator = delegator;
        this.delegatee = delegatee;
        this.account = loadOrCreateAccount(delegator);
        this.manager = DelegatedVotesManager.loadOrCreateManager(
            this.token,
            this.delegator,
            this.delegatee
        );

        const lastTokenDelegate = this.getLastDelegation();

        if (lastTokenDelegate && !lastTokenDelegate.blockEnded) {
            this.lastTokenDelegate = lastTokenDelegate;
        }
    }

    private getLastDelegation(): TokenDelegate | null {
        const delegatee = DelegatedVotesManager.getAccountDelegateeField(
            this.token,
            this.account
        );
        if (
            delegatee &&
            this.getAccountDelegateType() ==
                DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY
        ) {
            log.info("{} Use old delegatee {} (delegator {} index {})", [
                this.token == DelegatedVotesManager.ECO ? "ECO" : "ECOx",
                delegatee.toString(),
                this.delegator.toHexString(),
                (this.manager.index - 1).toString(),
            ]);

            return TokenDelegate.load(
                DelegatedVotesManager.getId(
                    this.token,
                    this.delegator,
                    Address.fromString(delegatee),
                    this.manager.index - 1
                )
            );
        }

        if (
            !delegatee &&
            this.getAccountDelegateType() ==
                DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY
        ) {
            log.info("{} null delegate (delegator {} index {})", [
                this.token == DelegatedVotesManager.ECO ? "ECO" : "ECOx",
                this.delegator.toHexString(),
                (this.manager.index - 1).toString(),
            ]);
        }

        return TokenDelegate.load(
            DelegatedVotesManager.getId(
                this.token,
                this.delegator,
                this.delegatee,
                this.manager.index - 1
            )
        );
    }

    delegatePrimary(amount: BigInt, blockNumber: BigInt): void {
        this.createEntity(amount, blockNumber);
        this.setAccountDelegateType(
            DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY
        );
    }

    incrementDelegation(amount: BigInt, blockNumber: BigInt): void {
        const prevAmount = this.getPrevAmount();
        const totalAmount = amount.plus(prevAmount);
        this.createEntity(totalAmount, blockNumber);
    }

    delegateAmount(amount: BigInt, blockNumber: BigInt): void {
        this.incrementDelegation(amount, blockNumber);
        this.setAccountDelegateType(
            DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_AMOUNT
        );
    }

    undelegateAmount(amount: BigInt, blockNumber: BigInt): void {
        this.decreaseAmount(amount, blockNumber);
    }

    undelegatePrimary(blockNumber: BigInt): void {
        this.undelegate(blockNumber);
    }

    private decreaseAmount(amount: BigInt, blockNumber: BigInt): void {
        const prevAmount = this.getPrevAmount();
        const totalAmount = prevAmount.plus(amount);

        if (!totalAmount.isZero()) {
            this.createEntity(totalAmount, blockNumber);
        } else if (this.lastTokenDelegate) {
            this.undelegate(blockNumber);
        }
    }

    private undelegate(blockNumber: BigInt): void {
        this.endLastRecord(blockNumber);
        this.setAccountDelegateType(
            DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_NONE
        );
    }

    private endLastRecord(blockNumber: BigInt): void {
        if (!this.lastTokenDelegate) {
            throw new Error(
                `Could not end last delegation for delegator ${this.delegator.toHexString()} (delegatee ${this.delegatee.toHexString()}) on block ${blockNumber}`
            );
        }

        if (this.lastTokenDelegate!.blockStarted.equals(blockNumber)) {
            store.remove("TokenDelegate", this.lastTokenDelegate!.id);
        } else {
            this.lastTokenDelegate!.blockEnded = blockNumber;
        }
    }

    save(): void {
        this.account.save();
        this.manager.save();
        if (this.tokenDelegate) this.tokenDelegate!.save();
        if (this.lastTokenDelegate) this.lastTokenDelegate!.save();
    }

    private createEntity(amount: BigInt, blockStarted: BigInt): void {
        const tokenDelegate = new TokenDelegate(
            DelegatedVotesManager.getId(
                this.token,
                this.delegator,
                this.delegatee,
                this.manager.index
            )
        );

        tokenDelegate.amount = amount;
        tokenDelegate.token = this.token;
        tokenDelegate.manager = this.manager.id;
        tokenDelegate.blockStarted = blockStarted;
        tokenDelegate.delegator = this.delegator.toHexString();
        tokenDelegate.delegatee = this.delegatee.toHexString();

        this.tokenDelegate = tokenDelegate;

        if (this.lastTokenDelegate) {
            this.endLastRecord(blockStarted);
        }

        this.incrementAccountIndex();
    }

    private incrementAccountIndex(): void {
        this.manager.index += 1;
    }

    private getAccountDelegateType(): string {
        return this.account
            .get(DelegatedVotesManager.getAccountDelegateTypeField(this.token))!
            .toString();
    }

    private setAccountDelegateType(type: string): void {
        log.info("{} delegator {} type set to {}", [
            this.token == DelegatedVotesManager.STAKED_ECO_X ? "ECOx" : "ECO",
            this.account.id,
            type,
        ]);
        this.account.set(
            DelegatedVotesManager.getAccountDelegateTypeField(this.token),
            Value.fromString(type)
        );
    }

    private getPrevAmount(): BigInt {
        if (!this.lastTokenDelegate) return BigInt.zero();
        return this.lastTokenDelegate!.amount;
    }

    public static handleUndelegateEvent(
        token: string,
        event: ethereum.Event
    ): void {
        const index = event.logIndex
            .minus(event.receipt!.logs[0].logIndex)
            .toI32();
        const nextIndex = index + 1;

        if (!(event.receipt && event.receipt!.logs.length > nextIndex)) return;

        const nextLog = event.receipt!.logs.at(nextIndex);

        if (
            !(
                nextLog.topics.length > 0 &&
                nextLog.topics[0].toHexString() ==
                    DelegatedVotesManager.UPDATE_VOTES_EVENT_SIG
            )
        )
            return;

        const delegatee = event.parameters[0].value.toAddress();
        const delegateeVp = event.parameters[1].value.toBigInt();
        const delegateePrevVP = DelegatedVotesManager.getPrevVotingPower(
            token,
            event,
            delegatee,
            index
        );
        const delegateeDiff = delegateePrevVP.minus(delegateeVp);

        const delegator = DelegatedVotesManager.fromTopicToAddress(
            nextLog.topics[1]
        );
        const delegatorVp = DelegatedVotesManager.fromTopicDataToBigInt(
            nextLog.data
        );
        const delegatorPrevVP = DelegatedVotesManager.getPrevVotingPower(
            token,
            event,
            delegator,
            index
        );
        const delegatorDiff = delegatorVp.minus(delegatorPrevVP);

        const delegatorAccount = loadOrCreateAccount(delegator);

        log.info(
            'delegatorAccount.ecoDelegationType == "Amount" {} |' +
                "!delegatee.equals(delegator) {} |" +
                "!delegator.equals(Address.zero()) {} |" +
                "!delegatee.equals(Address.zero()) {} |" +
                "delegatorVp.gt(delegatorPrevVP) {} |" +
                "delegateeVp.lt(delegateePrevVP) {} |" +
                "delegatorDiff.equals(delegateeDiff) {}",
            [
                (
                    delegatorAccount.ecoDelegationType ==
                    DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_AMOUNT
                ).toString(),
                (!delegatee.equals(delegator)).toString(),
                (!delegator.equals(Address.zero())).toString(),
                (!delegatee.equals(Address.zero())).toString(),
                delegatorVp.gt(delegatorPrevVP).toString(),
                delegateeVp.lt(delegateePrevVP).toString(),
                delegatorDiff.equals(delegateeDiff).toString(),
            ]
        );

        log.info(
            "delegatorAccount.ecoDelegationType {} | " +
                "next log data {} | " +
                "delegatee {} | " +
                "delegator {} | " +
                "delegatorVp {} | " +
                "delegatorPrevVP {} | " +
                "delegatorDiff {} | " +
                "delegateeVp {} | " +
                "delegateePrevVP {} | " +
                "delegateeDiff {}c-",
            [
                delegatorAccount.ecoDelegationType,
                nextLog.data.toHexString(),
                delegatee.toHexString(),
                delegator.toHexString(),
                delegatorVp.toHexString(),
                delegatorPrevVP.toHexString(),
                delegatorDiff.toHexString(),
                delegateeVp.toHexString(),
                delegateePrevVP.toHexString(),
                delegateeDiff.toHexString(),
            ]
        );

        if (
            !(
                delegatorAccount.ecoDelegationType ==
                    DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_AMOUNT &&
                !delegatee.equals(delegator) &&
                !delegator.equals(Address.zero()) &&
                !delegatee.equals(Address.zero()) &&
                delegatorVp.gt(delegatorPrevVP) &&
                delegateeVp.lt(delegateePrevVP) &&
                delegatorDiff.equals(delegateeDiff)
            )
        ) {
            return;
        }

        const delegateManager = new DelegatedVotesManager(
            token,
            delegator,
            delegatee
        );
        if (delegateManager && delegateManager.lastTokenDelegate) {
            delegateManager.undelegateAmount(delegatorDiff, event.block.number);
            delegateManager.save();
        }
    }

    public static isPrimaryDelegation(event: ethereum.Event): boolean {
        if (!event.receipt || event.receipt!.logs.length == 0) return false;

        // Expected NewPrimaryDelegate event tx log index
        const expectedIndex =
            event.logIndex.minus(event.receipt!.logs[0].logIndex).toI32() + 3;
        if (event.receipt!.logs.length < expectedIndex) return false;

        const topic = event.receipt!.logs[expectedIndex].topics;

        return (
            topic[0].toHexString() ==
                DelegatedVotesManager.NEW_PRIMARY_DELEGATE_EVENT_SIG &&
            DelegatedVotesManager.fromTopicToAddress(topic[1]).equals(
                event.parameters[0].value.toAddress()
            ) &&
            DelegatedVotesManager.fromTopicToAddress(topic[2]).equals(
                event.parameters[1].value.toAddress()
            )
        );
    }

    private static fromTopicToAddress(topicParam: Bytes): Address {
        return Address.fromBytes(
            Bytes.fromUint8Array(
                Bytes.fromHexString(topicParam.toHexString()).subarray(12, 32)
            )
        );
    }

    private static fromTopicDataToBigInt(value: Bytes): BigInt {
        return BigInt.fromSignedBytes(Bytes.fromUint8Array(value.reverse()));
    }

    private static getPrevVotingPower(
        token: string,
        event: ethereum.Event,
        address: Address,
        lastIndex: i32
    ): BigInt {
        for (let i = lastIndex - 1; i >= 0; i--) {
            const currentLog = event.receipt!.logs[i];
            if (
                currentLog.topics[0].toHexString() ==
                    DelegatedVotesManager.UPDATE_VOTES_EVENT_SIG &&
                DelegatedVotesManager.fromTopicToAddress(
                    currentLog.topics[1]
                ).equals(address)
            ) {
                return DelegatedVotesManager.fromTopicDataToBigInt(
                    currentLog.data
                );
            }
        }

        const prevBlock = event.block.number.minus(BigInt.fromI32(1));

        if (token == DelegatedVotesManager.STAKED_ECO_X) {
            const ecoXStaking = ECOxStaking.bind(event.address);
            return ecoXStaking.getPastVotingGons(address, prevBlock);
        }

        const eco = ECO.bind(event.address);
        return eco.getPastVotingGons(address, prevBlock);
    }
}

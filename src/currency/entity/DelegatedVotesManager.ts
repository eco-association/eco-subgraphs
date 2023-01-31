import {
    Address,
    BigInt,
    Bytes,
    log,
    store,
    Value,
} from "@graphprotocol/graph-ts/index";
import { ethereum } from "@graphprotocol/graph-ts";
import { Account, TokenDelegate } from "../../../generated/schema";
import { loadOrCreateAccount } from "../index";

import { ECO } from "../../../generated/ECO/ECO";
import { ECOxStaking } from "../../../generated/ECOxStaking/ECOxStaking";

export class DelegatedVotesManager {
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

    public readonly lastTokenDelegate: TokenDelegate | null;

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
                DelegatedVotesManager.getTokenIndex(this.token, this.account) -
                    1
            )
        );

        if (lastTokenDelegate && !lastTokenDelegate.blockEnded) {
            this.lastTokenDelegate = lastTokenDelegate;
        }
    }

    delegatePrimary(amount: BigInt, blockNumber: BigInt): void {
        this.createEntity(amount, blockNumber);
        this.setAccountDelegateType("Primary");
    }

    incrementDelegation(amount: BigInt, blockNumber: BigInt): void {
        const prevAmount = this.getPrevAmount();
        const totalAmount = amount.plus(prevAmount);
        this.createEntity(totalAmount, blockNumber);
    }

    delegateAmount(amount: BigInt, blockNumber: BigInt): void {
        this.incrementDelegation(amount, blockNumber);
        this.setAccountDelegateType("Amount");
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
        this.incrementAccountIndex();
        this.setAccountDelegateType("None");
    }

    private endLastRecord(blockNumber: BigInt): void {
        if (this.lastTokenDelegate) {
            if (this.lastTokenDelegate!.blockStarted === blockNumber) {
                store.remove("TokenDelegate", this.lastTokenDelegate!.id);
            } else {
                this.lastTokenDelegate!.blockEnded = blockNumber;
            }
        }
    }

    save(): void {
        if (this.account) this.account.save();
        if (this.tokenDelegate) this.tokenDelegate!.save();
        if (this.lastTokenDelegate) this.lastTokenDelegate!.save();
    }

    private createEntity(amount: BigInt, blockStarted: BigInt): void {
        const index = DelegatedVotesManager.getTokenIndex(
            this.token,
            this.account
        );

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

        this.endLastRecord(blockStarted);
        this.incrementAccountIndex();
    }

    private incrementAccountIndex(): void {
        const index = DelegatedVotesManager.getTokenIndex(
            this.token,
            this.account
        );
        const newIndex = index + 1;
        const indexField = DelegatedVotesManager.getAccountTokenIndexField(
            this.token
        );
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
                (delegatorAccount.ecoDelegationType == "Amount").toString(),
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
                delegatorAccount.ecoDelegationType == "Amount" &&
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
                currentLog.topics[0].toHexString() ===
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

        if (token == "sEcox") {
            const ecoXStaking = ECOxStaking.bind(event.address);
            return ecoXStaking.getPastVotingGons(address, prevBlock);
        }

        const eco = ECO.bind(event.address);
        return eco.getPastVotingGons(address, prevBlock);
    }
}

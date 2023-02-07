import {
    Address,
    BigInt,
    Bytes,
    ethereum,
    store,
    Value,
} from "@graphprotocol/graph-ts";
import {
    Account,
    TokenDelegate,
    TokenDelegateManager,
} from "../../../generated/schema";
import { loadOrCreateAccount } from "../index";

import { NULL_ADDRESS } from "../../constants";

export class DelegatedVotesManager {
    public static readonly ECO: string = "eco";

    public static readonly STAKED_ECO_X: string = "sEcox";

    public static readonly ACCOUNT_DELEGATE_TYPE_NONE: string = "None";

    public static readonly ACCOUNT_DELEGATE_TYPE_AMOUNT: string = "Amount";

    public static readonly ACCOUNT_DELEGATE_TYPE_PRIMARY: string = "Primary";

    public static readonly NEW_PRIMARY_DELEGATE_EVENT_SIG: string =
        "0x88a6f95a94556f83d3752aaa691040ea5c04d9db823566be9f2f325eb866c9ae";

    public static readonly UPDATED_VOTES_EVENT_SIG: string =
        "0xd1b0c5e03e405cea97403894c17af4610d6d851ffe4baa03de1ca5e7c700cd75";

    public static readonly TRANSFER_EVENT_SIG: string =
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    public static readonly BASE_VALUE_TRANSFER_EVENT_SIG: string =
        "0xd62d118ec9618b21ba50e6814f78a20bf1e5b6fa0206ffe661a0ca53ce22874f";

    public lastTokenDelegate: TokenDelegate | null;

    private readonly token: string;

    private readonly account: Account; // Delegator account

    private readonly delegator: Address;

    private readonly delegatee: Address;

    private readonly manager: TokenDelegateManager;

    private tokenDelegate: TokenDelegate | null = null;

    constructor(token: string, delegator: Account, delegatee: Address) {
        this.token = token;
        this.delegator = Address.fromString(delegator.id);
        this.delegatee = delegatee;
        this.account = delegator;
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

    public static loadWithAddress(
        token: string,
        delegator: Address,
        delegatee: Address
    ): DelegatedVotesManager {
        return new DelegatedVotesManager(
            token,
            loadOrCreateAccount(delegator),
            delegatee
        );
    }

    public static load(
        token: string,
        delegator: Account,
        delegatee: Address
    ): DelegatedVotesManager {
        return new DelegatedVotesManager(token, delegator, delegatee);
    }

    public static isPrimaryDelegation(event: ethereum.Event): boolean {
        const delegatedAmount = event.parameters[2].value.toBigInt();

        const contractLogs = DelegatedVotesManager.getContractLogs(event);
        // Expected NewPrimaryDelegate event tx log index
        const index = DelegatedVotesManager.getEventIndex(event, contractLogs);

        // If delegated amount is zero, `UpdatedVotes` events are not emitted
        const expectedIndex = delegatedAmount.isZero() ? index + 1 : index + 3;

        if (expectedIndex >= contractLogs.length) return false;

        const topic = contractLogs[expectedIndex].topics;

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

    public static handleUndelegateEvent(
        token: string,
        event: ethereum.Event
    ): void {
        const contractLogs = DelegatedVotesManager.getContractLogs(event);
        const index = DelegatedVotesManager.getEventIndex(event, contractLogs);

        const nextIndex = index + 1;

        if (contractLogs.length <= nextIndex) return;

        const nextLog = contractLogs[nextIndex];

        if (
            !(
                nextLog.topics.length > 0 &&
                nextLog.topics[0].toHexString() ==
                    DelegatedVotesManager.UPDATED_VOTES_EVENT_SIG
            )
        ) {
            return;
        }

        const delegatee = loadOrCreateAccount(
            event.parameters[0].value.toAddress()
        );
        const delegateeVp = event.parameters[1].value.toBigInt();
        const delegateePrevVP = DelegatedVotesManager.getPrevVotingPower(
            token,
            delegatee
        );
        const delegateeDiff = delegateePrevVP.minus(delegateeVp);

        const delegator = loadOrCreateAccount(
            DelegatedVotesManager.fromTopicToAddress(nextLog.topics[1])
        );
        const delegatorVp = DelegatedVotesManager.fromTopicDataToBigInt(
            nextLog.data
        );
        const delegatorPrevVP = DelegatedVotesManager.getPrevVotingPower(
            token,
            delegator
        );
        const delegatorDiff = delegatorVp.minus(delegatorPrevVP);

        if (
            !(
                delegatee.id != delegator.id &&
                delegator.id != NULL_ADDRESS &&
                delegatee.id != NULL_ADDRESS &&
                delegatorVp.gt(delegatorPrevVP) &&
                delegateeVp.lt(delegateePrevVP) &&
                delegatorDiff.equals(delegateeDiff)
            )
        ) {
            return;
        }

        const transferEventSig =
            token == DelegatedVotesManager.ECO
                ? DelegatedVotesManager.BASE_VALUE_TRANSFER_EVENT_SIG
                : DelegatedVotesManager.TRANSFER_EVENT_SIG;

        const prevIndex =
            token == DelegatedVotesManager.ECO ? index - 2 : index - 1;

        let prevLog = prevIndex >= 0 ? contractLogs[prevIndex] : null;

        // Check undelegate first after transfer
        if (
            DelegatedVotesManager.getAccountDelegateType(token, delegatee) ==
                DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY &&
            prevLog &&
            prevLog.topics[0].toHexString() ==
                DelegatedVotesManager.UPDATED_VOTES_EVENT_SIG &&
            prevIndex - 2 >= 0
        ) {
            const transferTopics = contractLogs[prevIndex - 2].topics;
            const undelegateVPTopics = contractLogs[index - 2].topics;
            const delegateVPTopics = contractLogs[index - 1].topics;
            if (
                transferTopics[0].toHexString() == transferEventSig &&
                undelegateVPTopics[0].toHexString() ==
                    DelegatedVotesManager.UPDATED_VOTES_EVENT_SIG &&
                delegateVPTopics[0].toHexString() ==
                    DelegatedVotesManager.UPDATED_VOTES_EVENT_SIG &&
                DelegatedVotesManager.fromTopicToAddress(
                    undelegateVPTopics[1]
                ).toHexString() == delegatee.id &&
                DelegatedVotesManager.fromTopicToAddress(
                    delegateVPTopics[1]
                ).toHexString() ==
                    DelegatedVotesManager.getAccountPrimaryDelegatee(
                        token,
                        delegatee
                    )
            ) {
                prevLog = contractLogs[prevIndex - 2];
            }
        }

        if (
            prevLog &&
            prevLog.topics[0].toHexString() == transferEventSig &&
            DelegatedVotesManager.fromTopicToAddress(
                prevLog.topics[1]
            ).toHexString() == delegatee.id &&
            DelegatedVotesManager.fromTopicToAddress(
                prevLog.topics[2]
            ).toHexString() == delegator.id &&
            delegatorDiff.equals(
                DelegatedVotesManager.fromTopicDataToBigInt(prevLog.data)
            )
        ) {
            // Prevented undelegate from token transfer
            return;
        }

        const delegateManager = DelegatedVotesManager.load(
            token,
            delegator,
            Address.fromString(delegatee.id)
        );
        if (delegateManager && delegateManager.lastTokenDelegate) {
            delegateManager.undelegateAmount(delegatorDiff, event.block.number);
            delegateManager.save();
        }
    }

    public static getManagerId(
        token: string,
        delegator: Address,
        delegatee: Address
    ): string {
        return `${token}-${delegator.toHexString()}-${delegatee.toHexString()}`;
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

    private static getPrevVotingPower(token: string, account: Account): BigInt {
        return token == DelegatedVotesManager.STAKED_ECO_X
            ? account.stakedEcoXVotingPower
            : account.ecoVotingPower;
    }

    private static getId(
        token: string,
        delegator: Address,
        delegatee: Address,
        index: i32
    ): string {
        return `${token}-${delegator.toHexString()}-${delegatee.toHexString()}-${index.toString()}`;
    }

    private static getAccountPrimaryDelegatee(
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

    private static getContractLogs(event: ethereum.Event): Array<ethereum.Log> {
        if (!event.receipt) return [];
        const logs: Array<ethereum.Log> = [];

        for (let i = 0; i < event.receipt!.logs.length; i++) {
            const _log = event.receipt!.logs.at(i);
            if (_log.address.equals(event.address)) {
                logs.push(_log);
            }
        }
        return logs;
    }

    private static getEventIndex(
        event: ethereum.Event,
        logs: ethereum.Log[]
    ): i32 {
        for (let index = 0; index < logs.length; index++) {
            if (logs[index].logIndex == event.logIndex) {
                return index;
            }
        }
        throw new Error("Could not determine event index");
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

    private static getAccountDelegateType(
        token: string,
        account: Account
    ): string {
        return account
            .get(DelegatedVotesManager.getAccountDelegateTypeField(token))!
            .toString();
    }

    delegatePrimary(amount: BigInt, blockNumber: BigInt): void {
        if (
            this.lastTokenDelegate &&
            this.lastTokenDelegate!.delegatee == this.delegatee.toHexString()
        ) {
            // Duplicated primary delegation (SKIP)
            return;
        }

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

    save(): void {
        this.account.save();
        this.manager.save();
        if (this.tokenDelegate) this.tokenDelegate!.save();
        if (this.lastTokenDelegate) this.lastTokenDelegate!.save();
    }

    private getLastDelegation(): TokenDelegate | null {
        const primaryDelegatee =
            DelegatedVotesManager.getAccountPrimaryDelegatee(
                this.token,
                this.account
            );

        if (
            primaryDelegatee &&
            !Address.fromString(primaryDelegatee).equals(this.delegatee) &&
            DelegatedVotesManager.getAccountDelegateType(
                this.token,
                this.account
            ) == DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY
        ) {
            const delegateeAddress = Address.fromString(primaryDelegatee);
            const oldManager = DelegatedVotesManager.loadOrCreateManager(
                this.token,
                this.delegator,
                delegateeAddress
            );

            return TokenDelegate.load(
                DelegatedVotesManager.getId(
                    this.token,
                    this.delegator,
                    delegateeAddress,
                    oldManager.index - 1
                )
            );
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

    private decreaseAmount(amount: BigInt, blockNumber: BigInt): void {
        const prevAmount = this.getPrevAmount();
        const totalAmount = prevAmount.minus(amount);

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
        if (!this.lastTokenDelegate) return;

        if (this.lastTokenDelegate!.blockStarted.equals(blockNumber)) {
            store.remove("TokenDelegate", this.lastTokenDelegate!.id);
            this.decreaseAccountIndex(this.lastTokenDelegate!.manager);
            this.lastTokenDelegate = null;
        } else {
            this.lastTokenDelegate!.blockEnded = blockNumber;
        }
    }

    private createEntity(amount: BigInt, blockStarted: BigInt): void {
        this.endLastRecord(blockStarted);

        if (amount.isZero()) return;

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

        this.incrementAccountIndex();
    }

    private incrementAccountIndex(): void {
        this.manager.index += 1;
    }

    private decreaseAccountIndex(managerId: string): void {
        if (this.manager.id == managerId) {
            this.manager.index -= 1;
        } else {
            const manager = TokenDelegateManager.load(managerId);
            manager!.index -= 1;
            manager!.save();
        }
    }

    private setAccountDelegateType(type: string): void {
        this.account.set(
            DelegatedVotesManager.getAccountDelegateTypeField(this.token),
            Value.fromString(type)
        );
    }

    private getPrevAmount(): BigInt {
        if (this.lastTokenDelegate) return this.lastTokenDelegate!.amount;
        return BigInt.zero();
    }
}

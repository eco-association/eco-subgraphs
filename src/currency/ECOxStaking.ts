import { Address, ethereum, log } from "@graphprotocol/graph-ts";
import {
    UpdatedVotes as UpdatedVotesEvent,
    Transfer as TransferEvent,
    NewPrimaryDelegate as NewPrimaryDelegateEvent,
    DelegatedVotes as DelegatedVotesEvent,
} from "../../generated/ECOxStaking/ECOxStaking";
import { loadOrCreateAccount } from ".";
import { NULL_ADDRESS } from "../constants";
import { Token } from "./entity/Token";
import { VotingPower } from "../governance/entities/VotingPower";
import { HistoryRecord } from "../governance/entities/HistoryRecord";
import { sECOxBalance } from "../../generated/schema";
import { DelegatedVotesManager } from "./entity/DelegatedVotesManager";

function loadOrCreatesECOxBalance(
    id: string,
    block: ethereum.Block
): sECOxBalance {
    let newBalance = sECOxBalance.load(`${id}-${block.number.toString()}`);
    if (!newBalance) {
        newBalance = new sECOxBalance(`${id}-${block.number.toString()}`);
    }
    newBalance.account = id;
    newBalance.blockNumber = block.number;
    newBalance.timestamp = block.timestamp;
    return newBalance;
}

// ECOxStaking.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: TransferEvent): void {
    const from = loadOrCreateAccount(event.params.from);
    if (from.id != NULL_ADDRESS) {
        // not a mint
        from.sECOx = from.sECOx.minus(event.params.value);
        from.save();

        // create new historical sECOx balance entry
        const newBalance = loadOrCreatesECOxBalance(from.id, event.block);
        newBalance.value = from.sECOx;
        newBalance.save();
    } else {
        // is a mint, increment total supply
        Token.load("sEcox", event.address).increaseSupply(event.params.value);
    }

    const to = loadOrCreateAccount(event.params.to);
    if (to.id != NULL_ADDRESS) {
        // not a burn
        to.sECOx = to.sECOx.plus(event.params.value);
        to.save();

        const newBalance = loadOrCreatesECOxBalance(to.id, event.block);
        newBalance.value = to.sECOx;
        newBalance.save();
    } else {
        // is a burn, decrement total supply
        Token.load("sEcox", event.address).decreaseSupply(event.params.value);
    }

    if (
        !event.params.value.isZero() &&
        to.stakedEcoXDelegationType ==
            DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY &&
        to.sECOxDelegator
    ) {
        const delegationManger = DelegatedVotesManager.load(
            DelegatedVotesManager.STAKED_ECO_X,
            to,
            Address.fromString(to.sECOxDelegator!)
        );
        delegationManger.incrementDelegation(
            event.params.value,
            event.block.number
        );
        delegationManger.save();
    }
}

// ECOxStaking.UpdatedVotes(address delegate, uint256 newVotes)
export function handleUpdatedVotes(event: UpdatedVotesEvent): void {
    log.info("handleUpdatedVotes start {}", [event.logIndex.toString()]);
    DelegatedVotesManager.handleUndelegateEvent(
        DelegatedVotesManager.STAKED_ECO_X,
        event
    );

    // create new historical vote balance entry
    VotingPower.setSEcoX(
        event.params.voter.toHexString(),
        event.block.number,
        event.params.newVotes
    );

    const account = loadOrCreateAccount(event.params.voter);
    account.votes = event.params.newVotes;
    account.stakedEcoXVotingPower = event.params.newVotes;
    account.save();
}

// ECOxStaking.NewPrimaryDelegate(address, address)
export function handleDelegation(event: NewPrimaryDelegateEvent): void {
    const delegator = loadOrCreateAccount(event.params.delegator);
    if (!event.params.primaryDelegate.equals(event.params.delegator)) {
        const delegate = loadOrCreateAccount(event.params.primaryDelegate);
        delegator.sECOxDelegator = delegate.id;
        const record = new HistoryRecord(
            "sEcoXDelegate",
            "sEcox",
            event.block.timestamp,
            event.params.delegator
        );
        record.save();
    } else {
        // Record
        const record = new HistoryRecord(
            "sEcoXUndelegate",
            "sEcox",
            event.block.timestamp,
            event.params.delegator
        );
        record.save();

        log.info("ECOx Undelegating Primary (delegator {}) (delegatee {})", [
            event.params.delegator.toHexString(),
            delegator.sECOxDelegator!,
        ]);

        const delegateManager = DelegatedVotesManager.load(
            DelegatedVotesManager.STAKED_ECO_X,
            delegator,
            Address.fromString(delegator.sECOxDelegator!)
        );
        delegateManager.undelegatePrimary(event.block.number);
        delegateManager.save();

        delegator.sECOxDelegator = null;
    }
    delegator.save();
}

// ECOxStaking.DelegatedVotes(address delegator, address delegatee, uint256 amount)
export function handleDelegatedVotes(event: DelegatedVotesEvent): void {
    if (!event.receipt) return;

    const delegateManager = DelegatedVotesManager.loadWithAddress(
        DelegatedVotesManager.STAKED_ECO_X,
        event.params.delegator,
        event.params.delegatee
    );

    if (DelegatedVotesManager.isPrimaryDelegation(event)) {
        log.info(
            "ECOx Primary delegation (delegator {}) (delegatee {}) block {}",
            [
                event.params.delegator.toHexString(),
                event.params.delegatee.toHexString(),
                event.block.number.toString(),
            ]
        );
        delegateManager.delegatePrimary(
            event.params.amount,
            event.block.number
        );
    } else {
        log.info(
            "ECOx Amount delegation (delegator {}) (delegatee {}) block {}",
            [
                event.params.delegator.toHexString(),
                event.params.delegatee.toHexString(),
                event.block.number.toString(),
            ]
        );
        delegateManager.delegateAmount(event.params.amount, event.block.number);
    }

    delegateManager.save();
}

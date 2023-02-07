import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts";
import {
    Approval as ApprovalEvent,
    BaseValueTransfer as BaseValueTransferEvent,
    DelegatedVotes as DelegatedVotesEvent,
    ECO,
    NewInflationMultiplier as NewInflationMultiplierEvent,
    NewPrimaryDelegate as NewPrimaryDelegateEvent,
    UpdatedVotes as UpdatedVotesEvent,
} from "../../generated/ECO/ECO";
import {
    ECOAllowance,
    ECOBalance,
    InflationMultiplier,
} from "../../generated/schema";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateAccount } from ".";
import { Token } from "./entity/Token";
import { VotingPower } from "../governance/entities/VotingPower";
import { HistoryRecord } from "../governance/entities/HistoryRecord";
import { DelegatedVotesManager } from "./entity/DelegatedVotesManager";

function loadOrCreateECOBalance(id: string, block: ethereum.Block): ECOBalance {
    let newBalance = ECOBalance.load(`${id}-${block.number.toString()}`);
    if (!newBalance) {
        newBalance = new ECOBalance(`${id}-${block.number.toString()}`);
    }
    newBalance.account = id;
    newBalance.blockNumber = block.number;
    newBalance.timestamp = block.timestamp;
    return newBalance;
}

// ECO.NewInflationMultiplier(uint256)
export function handleNewInflationMultiplier(
    event: NewInflationMultiplierEvent
): void {
    // create new inflation multiplier
    const newInflationMultiplier = new InflationMultiplier(
        event.transaction.hash
    );

    const eco = ECO.bind(event.address);
    newInflationMultiplier.value = eco.getPastLinearInflation(
        event.block.number
    );

    newInflationMultiplier.blockNumber = event.block.number;
    newInflationMultiplier.save();
}

// ECO.Approval(address owner, address spender, uint256 value)
export function handleApproval(event: ApprovalEvent): void {
    const ownerAccount = loadOrCreateAccount(event.params.owner);
    const spender = event.params.spender.toHexString();

    const id = `${ownerAccount.id}-${spender}`;

    // load or create an allowance entity
    let allowance = ECOAllowance.load(id);

    if (allowance && event.params.value.equals(BigInt.fromString("0"))) {
        // allowance is not new and now zero, delete it
        store.remove("ECOAllowance", id);
    } else {
        if (!allowance) {
            allowance = new ECOAllowance(id);
            allowance.spender = spender;
            allowance.owner = ownerAccount.id;
        }

        // set allowed value
        allowance.value = event.params.value;
        allowance.save();
    }
}

// ECO.BaseValueTransfer(address from, address to, uint256 value)
export function handleBaseValueTransfer(event: BaseValueTransferEvent): void {
    const from = loadOrCreateAccount(event.params.from);

    if (from.id != NULL_ADDRESS) {
        // not a mint
        from.ECO = from.ECO.minus(event.params.value);
        from.save();

        // create new historical ECO balance entry
        const newBalance = loadOrCreateECOBalance(from.id, event.block);
        newBalance.value = from.ECO;
        newBalance.save();
    } else {
        // is a mint, increment total supply
        Token.load("eco", event.address).increaseSupply(event.params.value);
    }

    const to = loadOrCreateAccount(event.params.to);
    if (to.id != NULL_ADDRESS) {
        // not a burn
        to.ECO = to.ECO.plus(event.params.value);
        to.save();

        const newBalance = loadOrCreateECOBalance(to.id, event.block);
        newBalance.value = to.ECO;
        newBalance.save();
    } else {
        // is a burn, decrement total supply
        Token.load("eco", event.address).decreaseSupply(event.params.value);
    }

    if (
        !event.params.value.isZero() &&
        to.ecoDelegationType ==
            DelegatedVotesManager.ACCOUNT_DELEGATE_TYPE_PRIMARY &&
        to.ECODelegator
    ) {
        log.info(
            "ECO Increment Delegation (delegator {}) (delegatee {}) (block {})",
            [
                event.params.to.toHexString(),
                to.ECODelegator!,
                event.block.number.toString(),
            ]
        );
        const delegationManger = DelegatedVotesManager.load(
            DelegatedVotesManager.ECO,
            to,
            Address.fromString(to.ECODelegator!)
        );
        delegationManger.incrementDelegation(
            event.params.value,
            event.block.number
        );
        delegationManger.save();
    }
}

// ECO.UpdatedVotes(address delegate, uint256 newVotes)
export function handleUpdatedVotes(event: UpdatedVotesEvent): void {
    DelegatedVotesManager.handleUndelegateEvent(
        DelegatedVotesManager.ECO,
        event
    );

    // Gons => Amount
    const eco = ECO.bind(event.address);
    const inflation = eco.getPastLinearInflation(event.block.number);
    const amount = event.params.newVotes.div(inflation);

    // Create new history record
    VotingPower.setEco(
        event.params.voter.toHexString(),
        event.block.number,
        amount
    );

    const account = loadOrCreateAccount(event.params.voter);
    account.ecoVotingPower = event.params.newVotes;
    account.save();
}

// ECO.NewPrimaryDelegate(address, address)
export function handleDelegation(event: NewPrimaryDelegateEvent): void {
    const delegator = loadOrCreateAccount(event.params.delegator);
    if (!event.params.primaryDelegate.equals(event.params.delegator)) {
        const delegate = loadOrCreateAccount(event.params.primaryDelegate);
        delegator.ECODelegator = delegate.id;
        const record = new HistoryRecord(
            "EcoDelegate",
            "eco",
            event.block.timestamp,
            event.params.delegator
        );
        record.save();
    } else {
        const record = new HistoryRecord(
            "EcoUndelegate",
            "eco",
            event.block.timestamp,
            event.params.delegator
        );
        record.save();

        log.info("ECO Undelegating Primary (delegator {}) (delegatee {})-", [
            event.params.delegator.toHexString(),
            delegator.ECODelegator!,
        ]);

        const delegateManager = DelegatedVotesManager.load(
            DelegatedVotesManager.ECO,
            delegator,
            Address.fromString(delegator.ECODelegator!)
        );
        delegateManager.undelegatePrimary(event.block.number);
        delegateManager.save();

        delegator.ECODelegator = null;
    }
    delegator.save();
}

// ECO.DelegatedVotes(address delegator, address delegatee, uint256 amount)
export function handleDelegatedVotes(event: DelegatedVotesEvent): void {
    if (!event.receipt) return;

    const delegateManager = DelegatedVotesManager.loadWithAddress(
        DelegatedVotesManager.ECO,
        event.params.delegator,
        event.params.delegatee
    );

    if (DelegatedVotesManager.isPrimaryDelegation(event)) {
        log.info(
            "ECO Primary delegation (delegator {}) (delegatee {}) amount {} block {} -",
            [
                event.params.delegator.toHexString(),
                event.params.delegatee.toHexString(),
                event.params.amount.toHexString(),
                event.block.number.toString(),
            ]
        );
        delegateManager.delegatePrimary(
            event.params.amount,
            event.block.number
        );
    } else {
        log.info(
            "ECO Amount delegation (delegator {}) (delegatee {}) amount {} block {}",
            [
                event.params.delegator.toHexString(),
                event.params.delegatee.toHexString(),
                event.params.amount.toHexString(),
                event.block.number.toString(),
            ]
        );
        delegateManager.delegateAmount(event.params.amount, event.block.number);
    }

    delegateManager.save();
}

import { ethereum } from "@graphprotocol/graph-ts";
import {
    UpdatedVotes as UpdatedVotesEvent,
    Transfer as TransferEvent,
    NewPrimaryDelegate as NewPrimaryDelegateEvent,
} from "../../generated/ECOxStaking/ECOxStaking";
import { loadOrCreateAccount } from ".";
import { NULL_ADDRESS } from "../constants";
import { Token } from "./entity/Token";
import { VotingPower } from "../governance/entities/VotingPower";
import { HistoryRecord } from "../governance/entities/HistoryRecord";
import { sECOxBalance } from "../../generated/schema";

function loadOrCreatesECOxBalance(id: string, block: ethereum.Block): sECOxBalance {
    let newBalance = sECOxBalance.load(
        `${id}-${block.number.toString()}`
    );
    if (!newBalance) {
        newBalance = new sECOxBalance(
            `${id}-${block.number.toString()}`
        );
    }
    newBalance.account = id;
    newBalance.blockNumber = block.number;
    newBalance.timestamp = block.timestamp;
    return newBalance;
}

// ECOxStaking.UpdatedVotes(address delegate, uint256 newBalance)
export function handleUpdatedVotes(event: UpdatedVotesEvent): void {
    const delegate = loadOrCreateAccount(event.params.voter);
    delegate.votes = event.params.newVotes;
    delegate.save();

    // create new historical vote balance entry
    VotingPower.setSEcoX(delegate.id, event.block.number, delegate.votes);
}

// ECOxStaking.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: TransferEvent): void {
    const from = loadOrCreateAccount(event.params.from);
    const to = loadOrCreateAccount(event.params.to);

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
}

// ECOxStaking.NewPrimaryDelegate(address, address)
export function handleDelegation(event: NewPrimaryDelegateEvent): void {
    const delegator = loadOrCreateAccount(event.params.delegator);
    if (event.params.primaryDelegate.toHexString() != delegator.id) {
        const delegate = loadOrCreateAccount(event.params.primaryDelegate);
        delegator.sECOxDelegator = delegate.id;
        const record = new HistoryRecord(
            "sEcoXDelegate",
            "sEcoX",
            event.block.timestamp,
            event.params.delegator
        );
        record.save();
    } else {
        delegator.sECOxDelegator = null;

        // Record
        const record = new HistoryRecord(
            "sEcoXUndelegate",
            "sEcoX",
            event.block.timestamp,
            event.params.delegator
        );
        record.save();
    }
    delegator.save();
}

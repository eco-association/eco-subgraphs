import { BigInt, store } from "@graphprotocol/graph-ts";
import {
    ECO,
    Approval as ApprovalEvent,
    UpdatedVotes as UpdatedVotesEvent,
    BaseValueTransfer as BaseValueTransferEvent,
    NewInflationMultiplier as NewInflationMultiplierEvent,
} from "../../generated/ECO/ECO";
import {
    ECOAllowance,
    ECOBalance,
    InflationMultiplier,
    VotingPower,
} from "../../generated/schema";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateAccount } from ".";
import { Token } from "./entity/Token";

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
    const to = loadOrCreateAccount(event.params.to);

    if (from.id != NULL_ADDRESS) {
        // not a mint
        from.ECO = from.ECO.minus(event.params.value);
        from.save();

        // create new historical ECO balance entry
        const newBalance = new ECOBalance(
            `${event.transaction.hash.toHexString()}-${from.id}`
        );
        newBalance.account = from.id;
        newBalance.value = from.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    } else {
        // is a mint, increment total supply
        Token.load("eco", event.address).increaseSupply(event.params.value);
    }

    if (to.id != NULL_ADDRESS) {
        // not a burn
        to.ECO = to.ECO.plus(event.params.value);
        to.save();

        const newBalance = new ECOBalance(
            `${event.transaction.hash.toHexString()}-${to.id}`
        );
        newBalance.account = to.id;
        newBalance.value = to.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    } else {
        // is a burn, decrement total supply
        Token.load("eco", event.address).decreaseSupply(event.params.value);
    }
}

// ECO.UpdatedVotes(address delegate, uint256 newBalance)
export function handleUpdatedVotes(event: UpdatedVotesEvent): void {
    const delegate = loadOrCreateAccount(event.params.voter);
    delegate.votes = event.params.newVotes;
    delegate.save();

    // create new historical vote balance entry
    const newBalance = new VotingPower(event.transaction.hash);
    newBalance.token = 'eco';
    newBalance.account = delegate.id;
    newBalance.value = delegate.votes;
    newBalance.blockNumber = event.block.number;
    newBalance.save();
}

import {
    UpdatedVotes as UpdatedVotesEvent,
    Transfer as TransferEvent,
    NewPrimaryDelegate as NewPrimaryDelegateEvent,
} from "../../generated/ECOxStaking/ECOxStaking";
import { sECOxBalance } from "../../generated/schema";
import { loadOrCreateAccount } from ".";
import { NULL_ADDRESS } from "../constants";
import { Token } from "./entity/Token";

// ECOxStaking.UpdatedVotes(address delegate, uint256 newBalance)
export function handleUpdatedVotes(event: UpdatedVotesEvent): void {
    const delegate = loadOrCreateAccount(event.params.voter.toHexString());

    delegate.sECOx = event.params.newVotes;
    delegate.save();

    // create new historical sECOx balance entry
    const newBalance = new sECOxBalance(event.transaction.hash);
    newBalance.account = delegate.id;
    newBalance.value = delegate.sECOx;
    newBalance.blockNumber = event.block.number;
    newBalance.save();
}

// ECOxStaking.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: TransferEvent): void {
    const from = loadOrCreateAccount(event.params.from.toHexString());
    const to = loadOrCreateAccount(event.params.to.toHexString());

    if (from.id !== NULL_ADDRESS) {
        // not a mint
        from.sECOx = from.sECOx.minus(event.params.value);
        from.save();
    } else {
        // is a mint, increment total supply
        Token.load("sEcox", event.address).increaseSupply(event.params.value);
    }

    if (to.id !== NULL_ADDRESS) {
        // not a burn
        to.sECOx = to.sECOx.plus(event.params.value);
        to.save();
    } else {
        // is a burn, decrement total supply
        Token.load("sEcox", event.address).decreaseSupply(event.params.value);
    }
}

export function handleDelegation(event: NewPrimaryDelegateEvent): void {
    const delegator = loadOrCreateAccount(event.params.delegator.toHexString());
    delegator.ECOxDelegator = event.params.primaryDelegate;
    delegator.save();
}

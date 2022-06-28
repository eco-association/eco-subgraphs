import { BaseValueTransfer, ChangeDelegate, ChangeDelegateVotes, NewInflationMultiplier, Transfer } from "../../generated/ECO/ECO";

import { Account, ECOBalance, InflationMultiplier } from "../../generated/schema";

import { NULL_ADDRESS } from "../constants";
import { BigInt, log } from "@graphprotocol/graph-ts";

// ECO.NewInflationMultiplier(uint256)
export function handleNewInflationMultiplier(event: NewInflationMultiplier): void {
    log.info("New Inflation Multiplier = {}", [event.params.inflationMultiplier.toString()]);

    // create new inflation multiplier
    let newInflationMultiplier = new InflationMultiplier(event.transaction.hash);

    newInflationMultiplier.value = event.params.inflationMultiplier;
    newInflationMultiplier.blockNumber = event.block.number;
    newInflationMultiplier.save();

}


function loadOrCreateAccount(address: string): Account {
    let account = Account.load(address);
    if (!account) {
        account = new Account(address);
        account.ECO = BigInt.fromString("0");
        account.save();
    }
    return account;
}

// ECO.BaseValueTransfer(address indexed from, address indexed to, uint256 value)
export function handleBaseValueTransfer(event: BaseValueTransfer): void {
    log.info("ECO Transfer (base): from = {}, to = {} value = {}", [event.params.from.toHexString(), event.params.to.toHexString(), event.params.value.toString()]);

    let from = loadOrCreateAccount(event.params.from.toHexString());
    let to = loadOrCreateAccount(event.params.to.toHexString());

    // save underlying value with new balance

    if (from.id != NULL_ADDRESS.toHexString()) {
        // not a mint
        from.ECO = from.ECO.minus(event.params.value);
        from.save();

        let newBalance = new ECOBalance(event.transaction.hash.toHexString() + "-" + from.id);

        newBalance.account = from.id;
        newBalance.amount = from.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    }

    if (to.id != NULL_ADDRESS.toHexString()) {
        // not a burn
        to.ECO = to.ECO.plus(event.params.value);
        to.save();

        let newBalance = new ECOBalance(event.transaction.hash.toHexString() + "-" + to.id);

        newBalance.account = to.id;
        newBalance.amount = to.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    }
}

// ECO.Transfer(address indexed from, address indexed to, uint256 value)
export function handleTransfer(event: Transfer): void {
    log.info("ECO Transfer: from = {}, to = {} value = {}", [event.params.from.toHexString(), event.params.to.toHexString(), event.params.value.toString()]);
}

// ECO.ChangeDelegateVotes(address indexed delegate, uint256 newBalance)
export function handleChangeDelegateVotes(event: ChangeDelegateVotes): void {
    log.info("ECO Delegate votes changed: delegate = {}, new balance = {}", [event.params.delegate.toHexString(), event.params.newBalance.toString()]);
}

// ECO.ChangeDelegate(address indexed delegator, address indexed toDelegate)
export function handleChangeDelegate(event: ChangeDelegate): void {
    log.info("ECO Delegate Changed: delegator = {}, toDelegate = {}", [event.params.delegator.toHexString(), event.params.toDelegate.toHexString()]);
}

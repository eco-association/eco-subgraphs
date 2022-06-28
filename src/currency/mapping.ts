import { NewInflationMultiplier, BaseValueTransfer, Approval} from "../../generated/ECO/ECO";
import { Transfer } from "../../generated/ECOx/ECOx";
import { ChangeDelegateVotes } from "../../generated/ECOxLockup/ECOxLockup";
import { Account, ECOAllowance, ECOBalance, InflationMultiplier } from "../../generated/schema";

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
        account.ECOx = BigInt.fromString("0");
        account.save();
    }
    return account;
}

// ECO.Approval(address indexed owner, address indexed spender, uint256 value)
export function handleApproval(event: Approval): void {
    log.info("ECO Approval: owner = {}, spender = {} value = {}", [event.params.owner.toHexString(), event.params.spender.toHexString(), event.params.value.toString()]);
    
    let ownerAccount = loadOrCreateAccount(event.params.owner.toHexString());
    let spender = event.params.spender.toHexString();
    
    // load or create a new allowance entity
    let newAllowance = ECOAllowance.load(ownerAccount.id + "-" + spender);
    if (!newAllowance) {
        newAllowance = new ECOAllowance(ownerAccount.id + "-" + spender);
        newAllowance.spender = spender;
        newAllowance.owner = ownerAccount.id;
    }
    // set allowed value
    newAllowance.value = event.params.value;
    newAllowance.save();

}

// ECO.BaseValueTransfer(address indexed from, address indexed to, uint256 value)
export function handleBaseValueTransfer(event: BaseValueTransfer): void {
    log.info("ECO Transfer (base): from = {}, to = {} value = {}", [event.params.from.toHexString(), event.params.to.toHexString(), event.params.value.toString()]);

    let from = loadOrCreateAccount(event.params.from.toHexString());
    let to = loadOrCreateAccount(event.params.to.toHexString());

    if (from.id != NULL_ADDRESS.toHexString()) {
        // not a mint
        from.ECO = from.ECO.minus(event.params.value);
        from.save();

        let newBalance = new ECOBalance(event.transaction.hash.toHexString() + "-" + from.id);

        newBalance.account = from.id;
        newBalance.value = from.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    }

    if (to.id != NULL_ADDRESS.toHexString()) {
        // not a burn
        to.ECO = to.ECO.plus(event.params.value);
        to.save();

        let newBalance = new ECOBalance(event.transaction.hash.toHexString() + "-" + to.id);

        newBalance.account = to.id;
        newBalance.value = to.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    }
}


// ECOx.Transfer(address indexed from, address indexed to, uint256 value)
export function handleTransfer(event: Transfer): void {
    log.info("ECOx Transfer: from = {}, to = {} value = {}", [event.params.from.toHexString(), event.params.to.toHexString(), event.params.value.toString()]);
    
    let from = loadOrCreateAccount(event.params.from.toHexString());
    let to = loadOrCreateAccount(event.params.to.toHexString());

    if (from.id != NULL_ADDRESS.toHexString()) {
        // not a mint
        from.ECOx = from.ECOx.minus(event.params.value);
        from.save();

    }
    if (to.id != NULL_ADDRESS.toHexString()) {
        // not a burn
        to.ECOx = to.ECOx.plus(event.params.value);
        to.save();

    }
}

// ECOxLockup.ChangeDelegateVotes(address indexed delegate, uint256 newBalance)
export function handleChangeDelegateVotes(event: ChangeDelegateVotes): void {
    log.info("ECOxLockup Delegate votes changed: delegate = {}, new balance = {}", [event.params.delegate.toHexString(), event.params.newBalance.toString()]);

}

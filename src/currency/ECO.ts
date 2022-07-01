import { NewInflationMultiplier, BaseValueTransfer, Approval} from "../../generated/ECO/ECO";
import { ECOAllowance, ECOBalance, InflationMultiplier } from "../../generated/schema";

import { NULL_ADDRESS } from "../constants";
import { BigInt, store } from "@graphprotocol/graph-ts";

import { loadOrCreateAccount } from "./";

// ECO.NewInflationMultiplier(uint256)
export function handleNewInflationMultiplier(event: NewInflationMultiplier): void {
    // create new inflation multiplier
    let newInflationMultiplier = new InflationMultiplier(event.transaction.hash);

    newInflationMultiplier.value = event.params.inflationMultiplier;
    newInflationMultiplier.blockNumber = event.block.number;
    newInflationMultiplier.save();

}

// ECO.Approval(address owner, address spender, uint256 value)
export function handleApproval(event: Approval): void {
    let ownerAccount = loadOrCreateAccount(event.params.owner.toHexString());
    let spender = event.params.spender.toHexString();
    
    const id = ownerAccount.id + "-" + spender;

    // load or create an allowance entity
    let allowance = ECOAllowance.load(id);

    if (allowance && event.params.value.equals(BigInt.fromString("0"))) {
        // allowance is not new and now zero, delete it
        store.remove('ECOAllowance', id);
    }
    else {
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
export function handleBaseValueTransfer(event: BaseValueTransfer): void {
    let from = loadOrCreateAccount(event.params.from.toHexString());
    let to = loadOrCreateAccount(event.params.to.toHexString());

    if (from.id != NULL_ADDRESS) {
        // not a mint
        from.ECO = from.ECO.minus(event.params.value);
        from.save();

        // create new historical ECO balance entry
        let newBalance = new ECOBalance(event.transaction.hash.toHexString() + "-" + from.id);
        newBalance.account = from.id;
        newBalance.value = from.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    }

    if (to.id != NULL_ADDRESS) {
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

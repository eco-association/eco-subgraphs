import { BigInt, store } from "@graphprotocol/graph-ts";
import {
    NewInflationMultiplier,
    BaseValueTransfer,
    Approval,
} from "../../generated/ECO/ECO";
import {
    ECOAllowance,
    ECOBalance,
    InflationMultiplier,
} from "../../generated/schema";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateAccount } from ".";
import { Token } from "./entity/Token";

// ECO.NewInflationMultiplier(uint256)
export function handleNewInflationMultiplier(
    event: NewInflationMultiplier
): void {
    // create new inflation multiplier
    const newInflationMultiplier = new InflationMultiplier(
        event.transaction.hash
    );

    newInflationMultiplier.value = event.params.inflationMultiplier;
    newInflationMultiplier.blockNumber = event.block.number;
    newInflationMultiplier.save();
}

// ECO.Approval(address owner, address spender, uint256 value)
export function handleApproval(event: Approval): void {
    const ownerAccount = loadOrCreateAccount(event.params.owner);
    const spender = event.params.spender.toHexString();

    const id = `${ownerAccount.id.toHexString()}-${spender}`;

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
export function handleBaseValueTransfer(event: BaseValueTransfer): void {
    const from = loadOrCreateAccount(event.params.from);
    const to = loadOrCreateAccount(event.params.to);

    if (from.id.toHexString() != NULL_ADDRESS) {
        // not a mint
        from.ECO = from.ECO.minus(event.params.value);
        from.save();

        // create new historical ECO balance entry
        const newBalance = new ECOBalance(
            `${event.transaction.hash.toHexString()}-${from.id.toHexString()}`
        );
        newBalance.account = from.id;
        newBalance.value = from.ECO;
        newBalance.blockNumber = event.block.number;
        newBalance.save();
    } else {
        // is a mint, increment total supply
        Token.load("eco", event.address).increaseSupply(event.params.value);
    }

    if (to.id.toHexString() != NULL_ADDRESS) {
        // not a burn
        to.ECO = to.ECO.plus(event.params.value);
        to.save();

        const newBalance = new ECOBalance(
            `${event.transaction.hash.toHexString()}-${to.id.toHexString()}`
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

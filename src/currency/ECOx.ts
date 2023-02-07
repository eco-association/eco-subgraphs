import { ethereum } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/ECOx/ECOx";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateAccount } from ".";
import { Token } from "./entity/Token";
import {
    ContractAddresses,
    ECOxBalance,
    LockupVault,
    VestingChunk,
} from "../../generated/schema";

function loadOrCreateECOxBalance(
    id: string,
    block: ethereum.Block
): ECOxBalance {
    let newBalance = ECOxBalance.load(`${id}-${block.number.toString()}`);
    if (!newBalance) {
        newBalance = new ECOxBalance(`${id}-${block.number.toString()}`);
    }
    newBalance.account = id;
    newBalance.blockNumber = block.number;
    newBalance.timestamp = block.timestamp;
    return newBalance;
}

// ECOx.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: Transfer): void {
    const from = loadOrCreateAccount(event.params.from);

    if (from.id != NULL_ADDRESS) {
        // not a mint
        from.ECOx = from.ECOx.minus(event.params.value);
        from.save();

        // create new historical ECOx balance entry
        const newBalance = loadOrCreateECOxBalance(from.id, event.block);
        newBalance.value = from.ECOx;
        newBalance.save();
    } else {
        // is a mint, increment total supply
        Token.load("ecox", event.address).increaseSupply(event.params.value);
    }

    const to = loadOrCreateAccount(event.params.to);
    if (to.id != NULL_ADDRESS) {
        // not a burn
        to.ECOx = to.ECOx.plus(event.params.value);
        to.save();

        const newBalance = loadOrCreateECOxBalance(to.id, event.block);
        newBalance.value = to.ECOx;
        newBalance.save();
    } else {
        // is a burn, decrement total supply
        Token.load("ecox", event.address).decreaseSupply(event.params.value);
    }

    const vault = LockupVault.load(to.id);
    const contractAddresses = ContractAddresses.load("0");
    if (
        vault &&
        vault.type == "Employee" &&
        contractAddresses &&
        from.id != contractAddresses.ecoxStaking
    ) {
        // (disregard any unstakes the vault might use)
        const chunk = VestingChunk.load(`${vault.id}-0`);
        if (chunk) {
            chunk.amount = chunk.amount.plus(event.params.value);
            chunk.save();
        }
    }
}

import { Transfer } from "../../generated/ECOx/ECOx";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateTokenHolder } from ".";
import { Token } from "./entity/Token";

// ECOx.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: Transfer): void {
    const from = loadOrCreateTokenHolder(event.params.from.toHexString());
    const to = loadOrCreateTokenHolder(event.params.to.toHexString());

    if (from.id !== NULL_ADDRESS) {
        // not a mint
        from.ECOx = from.ECOx.minus(event.params.value);
        from.save();
    } else {
        // is a mint, increment total supply
        Token.load("ecox", event.address).increaseSupply(event.params.value);
    }

    if (to.id !== NULL_ADDRESS) {
        // not a burn
        to.ECOx = to.ECOx.plus(event.params.value);
        to.save();
    } else {
        // is a burn, decrement total supply
        Token.load("ecox", event.address).decreaseSupply(event.params.value);
    }
}

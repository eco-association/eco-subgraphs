import { Transfer } from "../../generated/ECOx/ECOx";

import { NULL_ADDRESS } from "../constants";

import { loadOrCreateAccount } from "./";


// ECOx.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: Transfer): void {
    let from = loadOrCreateAccount(event.params.from.toHexString());
    let to = loadOrCreateAccount(event.params.to.toHexString());

    if (from.id != NULL_ADDRESS) {
        // not a mint
        from.ECOx = from.ECOx.minus(event.params.value);
        from.save();

    }
    if (to.id != NULL_ADDRESS) {
        // not a burn
        to.ECOx = to.ECOx.plus(event.params.value);
        to.save();

    }
}

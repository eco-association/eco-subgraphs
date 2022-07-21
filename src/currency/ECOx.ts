import { Transfer } from "../../generated/ECOx/ECOx";
import { NULL_ADDRESS } from "../constants";
import { loadOrCreateAccount, loadOrCreateToken } from ".";

// ECOx.Transfer(address from, address to, uint256 value)
export function handleTransfer(event: Transfer): void {
    const from = loadOrCreateAccount(event.params.from.toHexString());
    const to = loadOrCreateAccount(event.params.to.toHexString());

    if (from.id !== NULL_ADDRESS) {
        // not a mint
        from.ECOx = from.ECOx.minus(event.params.value);
        from.save();
    } else {
        // is a mint, increment total supply
        const ecoxToken = loadOrCreateToken("ecox", event.address);
        ecoxToken.totalSupply = ecoxToken.totalSupply.plus(event.params.value);
        ecoxToken.save();
    }

    if (to.id !== NULL_ADDRESS) {
        // not a burn
        to.ECOx = to.ECOx.plus(event.params.value);
        to.save();
    } else {
        // is a burn, decrement total supply
        const ecoxToken = loadOrCreateToken("ecox", event.address);
        ecoxToken.totalSupply = ecoxToken.totalSupply.minus(event.params.value);
        ecoxToken.save();
    }
}

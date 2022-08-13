import { Transfer as TransferEvent } from "../../generated/ECOWrapped/ECOWrapped";
import { loadOrCreateAccount } from "./index";
import { NULL_ADDRESS } from "../constants";
import { Token } from "./entity/Token";
import { loadContractAddresses } from "../governance";

export function handleTransfer(event: TransferEvent): void {
    // Set wECO contract address
    const addresses = loadContractAddresses();
    if (addresses && addresses.weco == NULL_ADDRESS) {
        addresses.weco = event.address.toHexString();
        addresses.save();
    }

    const from = loadOrCreateAccount(event.params.from);
    const to = loadOrCreateAccount(event.params.to);

    if (from.id != NULL_ADDRESS) {
        from.wECO = from.wECO.minus(event.params.amount);
        from.save();
    } else {
        Token.load("wECO", event.address).increaseSupply(event.params.amount);
    }

    if (to.id != NULL_ADDRESS) {
        to.wECO = to.wECO.plus(event.params.amount);
        to.save();
    } else {
        // is a burn, decrement total supply
        Token.load("wECO", event.address).decreaseSupply(event.params.amount);
    }
}

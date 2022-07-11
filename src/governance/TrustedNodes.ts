import { TrustedNodeAdded, TrustedNodeRemoved } from "../../generated/TrustedNodes/TrustedNodes";

import { Trustee } from "../../generated/schema";
import { store, log } from "@graphprotocol/graph-ts";

// TrustedNodeAdded(address indexed node)
export function handleTrustedNodeAdded(event: TrustedNodeAdded): void {
    log.info("New Trustee = {}", [event.params.node.toHexString()]);
    let newTrustee = new Trustee(event.params.node.toHexString());
    newTrustee.save();
}

// TrustedNodeRemoved(address indexed node)
export function handleTrustedNodeRemoved(event: TrustedNodeRemoved): void {
    log.info("Trustee Removed = {}", [event.params.node.toHexString()]);
    let id = event.params.node.toHexString();
    store.remove("Trustee", id);
}
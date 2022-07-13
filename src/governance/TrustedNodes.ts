import { TrustedNodeAdded, TrustedNodeRemoved } from "../../generated/TrustedNodes/TrustedNodes";

import { Trustee } from "../../generated/schema";
import { store } from "@graphprotocol/graph-ts";

// TrustedNodeAdded(address indexed node)
export function handleTrustedNodeAdded(event: TrustedNodeAdded): void {
    let newTrustee = new Trustee(event.params.node.toHexString());
    newTrustee.save();
}

// TrustedNodeRemoved(address indexed node)
export function handleTrustedNodeRemoved(event: TrustedNodeRemoved): void {
    let id = event.params.node.toHexString();
    store.remove("Trustee", id);
}
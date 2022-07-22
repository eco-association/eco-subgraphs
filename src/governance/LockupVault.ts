import { log } from "@graphprotocol/graph-ts";
import {
    Claimed as ClaimedEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
} from "../../generated/LockupVaultFactory/LockupVault";
import { LockupVault } from "../../generated/schema";

/**
 * Fired when a user claims
 * @param event
 */
export function handleClaimed(event: ClaimedEvent): void {
    const vault = LockupVault.load(event.address.toHexString());
    if (!vault) {
        log.error(
            "Invalid claimed event: Lockup vault not registered (contract address: {})",
            [event.address.toHexString()]
        );
        return;
    }
    vault.claimed = vault.claimed.plus(event.params.amount);
    vault.save();
}

/**
 * Fired when admin is changed.
 * @param event
 */
export function handleOwnershipTransferred(
    event: OwnershipTransferredEvent
): void {
    const vault = LockupVault.load(event.address.toHexString());
    if (!vault) {
        log.error(
            "Invalid ownership transferred event: Lockup vault not registered (contract address: {})",
            [event.address.toHexString()]
        );
        return;
    }
    vault.admin = event.params.newOwner;
    vault.save();
}

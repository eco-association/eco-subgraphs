import { log } from "@graphprotocol/graph-ts";
import {
    Claimed as ClaimedEvent,
    Clawback as ClawbackEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
} from "../../generated/LockupVaultFactory/LockupVault";
import { LockupVault } from "../../generated/schema";

/**
 * Fired when a user claims.
 * @dev LockupVault.Claimed(address, address, uint256)
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
 * @dev LockupVault.OwnershipTransferred(address, address)
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

/**
 * Fired when the admin claws back the remaining vesting amount.
 * @dev LockupVault.Clawback(uint256 amount)
 */
export function handleClawback(event: ClawbackEvent): void {
    const vault = LockupVault.load(event.address.toHexString());
    if (!vault) {
        log.error(
            "Invalid ownership transferred event: Lockup vault not registered (contract address: {})",
            [event.address.toHexString()]
        );
        return;
    }
    vault.clawbackTimestamp = event.block.timestamp;
    vault.save();
}

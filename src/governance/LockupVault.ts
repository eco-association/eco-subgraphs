import { log } from "@graphprotocol/graph-ts";
import {
    Claimed as ClaimedEvent,
    // Clawback as ClawbackEvent,
    OwnershipTransferred as OwnershipTransferredEvent,
    // Staked as StakedEvent,
    // Unstaked as UnstakedEvent,
} from "../../generated/Lockup/Lockup";
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

// export function handleStaked(event: StakedEvent): void {
//     const entity = new Staked(
//         `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`
//     );
//     entity.amount = event.params.amount;
//     entity.save();
// }
//
// export function handleUnstaked(event: UnstakedEvent): void {
//     const entity = new Unstaked(
//         `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`
//     );
//     entity.amount = event.params.amount;
//     entity.save();
// }

/**
 * Fired when unvested tokens are transfer back to the admin.
 * @param event
 */
// export function handleClawback(event: ClawbackEvent): void {
    // const entity = new Clawback(
    //     `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`
    // );
    // entity.amount = event.params.amount;
    // entity.save();
// }

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

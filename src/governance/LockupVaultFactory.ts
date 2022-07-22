import { BigInt } from "@graphprotocol/graph-ts/index";
import { VaultCreated as VaultCreatedEvent } from "../../generated/LockupVaultFactory/LockupVaultFactory";
import { LockupVault as LockupVaultContract } from "../../generated/LockupVaultFactory/LockupVault";
import { LockupVault, VestingChunk } from "../../generated/schema";
import { loadOrCreateAccount } from "../currency";

export function handleVaultCreated(event: VaultCreatedEvent): void {
    const vault = new LockupVault(event.params.vault.toHexString());
    const lockupVaultContract = LockupVaultContract.bind(event.params.vault);

    const beneficiary = loadOrCreateAccount(
        event.params.beneficiary.toHexString()
    );

    vault.beneficiary = beneficiary.id;
    vault.account = event.params.vault.toHexString();
    vault.admin = lockupVaultContract.owner();
    vault.token = event.params.token;
    vault.claimed = BigInt.fromString("0");
    vault.save();

    const timestamps = lockupVaultContract.timestamps();
    const amounts = lockupVaultContract.amounts();

    for (let i = 0; i < amounts.length; i++) {
        const chunk = new VestingChunk(
            `${event.params.vault.toHexString()}-${i}`
        );
        chunk.vault = vault.id;
        chunk.amount = amounts[i];
        chunk.timestamp = timestamps[i];
        chunk.save();
    }
}

import { BigInt } from "@graphprotocol/graph-ts/index";
import { VaultCreated as VaultCreatedEvent } from "../../generated/LockupVaultFactory/LockupVaultFactory";
import { LockupVault, VestingChunk } from "../../generated/schema";
import { Lockup as LockupVaultContract } from "../../generated/Lockup/Lockup";
import { loadOrCreateAccount } from "../currency";

export function handleVaultCreated(event: VaultCreatedEvent): void {
    const vault = new LockupVault(event.params.vault.toHexString());
    const lockupVaultContract = LockupVaultContract.bind(event.address);

    const beneficiary = loadOrCreateAccount(
        event.params.beneficiary.toHexString()
    );

    const timestamps = lockupVaultContract.timestamps();
    const amounts = lockupVaultContract.amounts();

    const vestingChunks: string[] = [];

    for (let i = 0; i < amounts.length; i++) {
        const chunk = new VestingChunk(`${event.address}-${i}`);
        chunk.vault = vault.id;
        chunk.amount = amounts[i];
        chunk.timestamp = timestamps[i];
        chunk.save();
        vestingChunks.push(chunk.id);
    }

    vault.beneficiary = beneficiary.id;
    vault.admin = lockupVaultContract.owner();
    vault.token = event.params.token;
    vault.claimed = BigInt.fromString("0");

    vault.ECO = BigInt.fromString("0");
    vault.ECOx = BigInt.fromString("0");
    vault.sECOx = BigInt.fromString("0");

    vault.vestingChunks = vestingChunks;
}

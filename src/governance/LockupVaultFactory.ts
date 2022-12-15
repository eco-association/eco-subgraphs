import { BigInt } from "@graphprotocol/graph-ts/index";
import { VaultCreated as VaultCreatedEvent } from "../../generated/LockupVaultFactory/LockupVaultFactory";
import { LockupVault as LockupVaultContract } from "../../generated/LockupVaultFactory/LockupVault";
import { LockupVault as LockupVaultTemplate } from "../../generated/templates";
import { LockupVault, VestingChunk } from "../../generated/schema";
import { loadOrCreateAccount } from "../currency";

function createVault(event: VaultCreatedEvent, type: string): void {
    // Instantiating a new Lockup Vault Template
    LockupVaultTemplate.create(event.params.vault);

    const vault = new LockupVault(event.params.vault.toHexString());
    const lockupVaultContract = LockupVaultContract.bind(event.params.vault);

    const beneficiary = loadOrCreateAccount(event.params.beneficiary);
    const vaultAccount = loadOrCreateAccount(event.params.vault);

    vault.type = type;
    vault.beneficiary = beneficiary.id;
    vault.account = vaultAccount.id;
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

export function handleVaultCreated(event: VaultCreatedEvent): void {
    createVault(event, "Investor");
}

export function handleEmployeeVaultCreated(event: VaultCreatedEvent): void {
    createVault(event, "Employee");
}

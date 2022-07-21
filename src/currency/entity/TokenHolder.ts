import { BigInt } from "@graphprotocol/graph-ts/index";
import { Account, LockupVault } from "../../../generated/schema";
import { loadOrCreateAccount } from "../index";

export class TokenHolder {
    readonly vault: LockupVault | null;

    readonly account: Account | null;

    constructor(address: string) {
        const vault = LockupVault.load(address);
        if (!vault) {
            this.vault = null;
            this.account = loadOrCreateAccount(address);
        } else {
            this.vault = vault;
            this.account = null;
        }
    }

    get id(): string {
        if (this.vault) return changetype<LockupVault>(this.vault).id;
        if (this.account) return changetype<Account>(this.account).id;
        throw new Error("Unexpected behaviour");
    }

    set id(value: string) {
        if (this.vault) changetype<LockupVault>(this.vault).id = value;
        if (this.account) changetype<Account>(this.account).id = value;
    }

    get ECO(): BigInt {
        if (this.vault) return changetype<LockupVault>(this.vault).ECO;
        if (this.account) return changetype<Account>(this.account).ECO;
        throw new Error("Unexpected behaviour");
    }

    set ECO(value: BigInt) {
        if (this.vault) changetype<LockupVault>(this.vault).ECO = value;
        if (this.account) changetype<Account>(this.account).ECO = value;
    }

    get ECOx(): BigInt {
        if (this.vault) return changetype<LockupVault>(this.vault).ECOx;
        if (this.account) return changetype<Account>(this.account).ECOx;
        throw new Error("Unexpected behaviour");
    }

    set ECOx(value: BigInt) {
        if (this.vault) changetype<LockupVault>(this.vault).ECOx = value;
        if (this.account) changetype<Account>(this.account).ECOx = value;
    }

    get sECOx(): BigInt {
        if (this.vault) return changetype<LockupVault>(this.vault).sECOx;
        if (this.account) return changetype<Account>(this.account).sECOx;
        throw new Error("Unexpected behaviour");
    }

    set sECOx(value: BigInt) {
        if (this.vault) changetype<LockupVault>(this.vault).sECOx = value;
        if (this.account) changetype<Account>(this.account).sECOx = value;
    }

    save(): void {
        if (this.vault) changetype<LockupVault>(this.vault).save();
        else if (this.account) changetype<Account>(this.account).save();
    }
}

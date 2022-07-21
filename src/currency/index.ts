import { BigInt } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";
import { TokenHolder } from "./entity/TokenHolder";

export function loadOrCreateAccount(address: string): Account {
    let account = Account.load(address);
    if (!account) {
        account = new Account(address);
        account.ECO = BigInt.fromString("0");
        account.ECOx = BigInt.fromString("0");
        account.sECOx = BigInt.fromString("0");
        account.save();
    }
    return account;
}

export function loadOrCreateTokenHolder(address: string): TokenHolder {
    return new TokenHolder(address);
}

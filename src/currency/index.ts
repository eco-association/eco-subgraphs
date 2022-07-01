import { Account } from "../../generated/schema";

import { BigInt } from "@graphprotocol/graph-ts";

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
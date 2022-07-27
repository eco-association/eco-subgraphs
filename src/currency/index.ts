import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";

export function loadOrCreateAccount(address: Address): Account {
    let account = Account.load(address);
    if (!account) {
        account = new Account(address);
        account.ECO = BigInt.fromString("0");
        account.ECOx = BigInt.fromString("0");
        account.sECOx = BigInt.fromString("0");
        account.votes = BigInt.fromString("0");
        account.save();
    }
    return account;
}

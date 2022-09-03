import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";

export function loadOrCreateAccount(address: Address): Account {
    let account = Account.load(address.toHexString());
    if (!account) {
        account = new Account(address.toHexString());
        account.ECO = BigInt.fromString("0");
        account.ECOx = BigInt.fromString("0");
        account.sECOx = BigInt.fromString("0");
        account.wECO = BigInt.fromString("0");
        account.votes = BigInt.fromString("0");
        account.ECODelegator = Bytes.empty();
        account.ECOxDelegator = Bytes.empty();
        account.save();
    }
    return account;
}

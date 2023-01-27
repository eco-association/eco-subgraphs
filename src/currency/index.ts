import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";

export function loadOrCreateAccount(address: Address): Account {
    let account = Account.load(address.toHexString());
    if (!account) {
        account = new Account(address.toHexString());
        account.ECO = BigInt.zero();
        account.ECOx = BigInt.zero();
        account.sECOx = BigInt.zero();
        account.wECO = BigInt.zero();
        account.votes = BigInt.zero();

        // Voting Power
        account.ecoDelegateIndex = 0;
        account.stakedEcoXDelegateIndex = 0;

        account.ecoDelegationType = "None";
        account.stakedEcoXDelegationType = "None";

        account.ECODelegator = null;
        account.sECOxDelegator = null;

        account.save();
    }
    return account;
}

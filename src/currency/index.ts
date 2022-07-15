import { Account, Token } from "../../generated/schema";

import { ERC20 } from "../../generated/ECO/ERC20";

import { Address, BigInt } from "@graphprotocol/graph-ts";

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

export function loadOrCreateToken(id: string, address: Address): Token {
    let token = Token.load(id);
    if (!token) {
        let tokenContract = ERC20.bind(address);
        token = new Token(id);
        token.name = tokenContract.name();
        token.symbol = tokenContract.symbol();
        token.decimals = tokenContract.decimals();
        token.totalSupply = BigInt.fromString('0');
    }
    return token;
}
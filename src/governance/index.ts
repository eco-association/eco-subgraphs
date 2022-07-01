import { Policy } from "../../generated/CurrencyTimer/Policy";

import { ContractAddresses } from "../../generated/schema";

import { ID_ECO, ID_ECOX, ID_TIMED_POLICIES, ID_CURRENCY_TIMER } from "../constants";


export function loadContractAddresses(): ContractAddresses | null {
    return ContractAddresses.load('0');
}

export function loadOrCreateContractAddresses(policy: Policy): ContractAddresses {
    let contracts = loadContractAddresses();
    if (!contracts) {
        contracts = new ContractAddresses('0');
        contracts.policy = policy._address.toHexString();
        contracts.currencyTimer = policy.policyFor(ID_CURRENCY_TIMER).toHexString();
        contracts.timedPolicies = policy.policyFor(ID_TIMED_POLICIES).toHexString();
        contracts.eco = policy.policyFor(ID_ECO).toHexString();
        contracts.ecox = policy.policyFor(ID_ECOX).toHexString();
    }
    return contracts;
}
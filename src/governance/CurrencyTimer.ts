import { NewCurrencyGovernance, CurrencyTimer } from "../../generated/CurrencyTimer/CurrencyTimer";
import { Policy } from "../../generated/CurrencyTimer/Policy";

import { CurrencyGovernance, Generation } from "../../generated/schema";

import { NULL_ADDRESS } from "../constants";

import { loadOrCreateContractAddresses } from "./";

// CurrencyTimer.NewCurrencyGovernance(addr)
export function handleNewCurrencyGovernance(event: NewCurrencyGovernance) {
    // get the new address
    let currencyTimerContract = CurrencyTimer.bind(event.address);

    let currencyGovernanceAddress = event.params.addr;

    // create new generation
    let generationNum = currencyTimerContract.currentGeneration();

    let currentGeneration = new Generation(generationNum.toString());
    currentGeneration.save();

    // subscribe to events from this generation's currencyGovernance contract
    // CurrencyGovernanceTemplate.create(currencyGovernanceAddress);

    // create currencyGovernance entity
    let newCurrencyGovernance = new CurrencyGovernance(currencyGovernanceAddress.toHexString());
    newCurrencyGovernance.generation = generationNum.toString();
    newCurrencyGovernance.save();

    // get contracts
    let policyContract = Policy.bind(currencyTimerContract.policy());
    let contracts = loadOrCreateContractAddresses(policyContract);
    // set current currencyGovernance contract
    // refresh policyVotes and policyProposals addresses
    contracts.currencyGovernance = currencyGovernanceAddress.toHexString();
    contracts.policyProposals = NULL_ADDRESS;
    contracts.policyVotes = NULL_ADDRESS;
    contracts.save();

}
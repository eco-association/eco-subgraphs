import { NewCurrencyGovernance, CurrencyTimer } from "../../generated/CurrencyTimer/CurrencyTimer";
import { Policy } from "../../generated/CurrencyTimer/Policy";

import { CurrencyGovernance as CurrencyGovernanceContract } from "../../generated/templates/CurrencyGovernance/CurrencyGovernance";
import { CurrencyGovernance as CurrencyGovernanceTemplate } from "../../generated/templates";
import { CurrencyGovernance, Generation } from "../../generated/schema";

import { NULL_ADDRESS } from "../constants";

import { loadOrCreateContractAddresses } from "./";

import { Address } from "@graphprotocol/graph-ts";

// CurrencyTimer.NewCurrencyGovernance(addr)
export function handleNewCurrencyGovernance(event: NewCurrencyGovernance): void {
    // get the new address
    
    let currencyTimerContract = CurrencyTimer.bind(event.address);

    let currencyGovernanceAddress = event.params.addr;
    
    // create new generation
    let generationNum = currencyTimerContract.currentGeneration();

    let currentGeneration = new Generation(generationNum.toString());
    currentGeneration.number = generationNum;
    currentGeneration.save();
    
    // subscribe to events from this generation's currencyGovernance contract
    CurrencyGovernanceTemplate.create(currencyGovernanceAddress);
    
    // create currencyGovernance entity
    let newCurrencyGovernance = new CurrencyGovernance(currencyGovernanceAddress.toHexString());
    newCurrencyGovernance.generation = generationNum.toString();
    
    // get currency governance contract and set initial values
    let currencyGovernanceContract = CurrencyGovernanceContract.bind(currencyGovernanceAddress);

    newCurrencyGovernance.proposalEnds = currencyGovernanceContract.proposalEnds();
    newCurrencyGovernance.votingEnds = currencyGovernanceContract.votingEnds();
    newCurrencyGovernance.revealEnds = currencyGovernanceContract.revealEnds();

    newCurrencyGovernance.defaultProposalMultiplier = currencyGovernanceContract.IDEMPOTENT_INFLATION_MULTIPLIER();
    newCurrencyGovernance.defaultProposalScore = currencyGovernanceContract.score(Address.fromString(NULL_ADDRESS));
    newCurrencyGovernance.defaultProposalEnacted = false;

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
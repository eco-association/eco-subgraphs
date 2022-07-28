import { Address } from "@graphprotocol/graph-ts";
import {
    NewCurrencyGovernance,
    CurrencyTimer,
    NewLockup
} from "../../generated/CurrencyTimer/CurrencyTimer";
import { Policy } from "../../generated/CurrencyTimer/Policy";
import { CurrencyGovernance as CurrencyGovernanceContract } from "../../generated/templates/CurrencyGovernance/CurrencyGovernance";
import { Lockup as LockupContract } from "../../generated/templates/Lockup/Lockup";
import {
    CurrencyGovernance as CurrencyGovernanceTemplate,
    Lockup as LockupTemplate
} from "../../generated/templates";
import {
    CurrencyGovernance,
    Generation,
    FundsLockup
} from "../../generated/schema";

import { NULL_ADDRESS } from "../constants";
import { loadOrCreateContractAddresses } from ".";

// CurrencyTimer.NewCurrencyGovernance(addr, generation)
export function handleNewCurrencyGovernance(
    event: NewCurrencyGovernance
): void {
    // get the new address
    const currencyGovernanceAddress = event.params.addr;

    // create new generation
    const generationNum = event.params.generation;

    const currentGeneration = new Generation(generationNum.toString());
    currentGeneration.number = generationNum;
    currentGeneration.save();

    // subscribe to events from this generation's currencyGovernance contract
    CurrencyGovernanceTemplate.create(currencyGovernanceAddress);

    // create currencyGovernance entity
    const newCurrencyGovernance = new CurrencyGovernance(
        currencyGovernanceAddress.toHexString()
    );
    newCurrencyGovernance.generation = generationNum.toString();

    // get currency governance contract and set initial values
    const currencyGovernanceContract = CurrencyGovernanceContract.bind(
        currencyGovernanceAddress
    );

    newCurrencyGovernance.proposalEnds =
        currencyGovernanceContract.proposalEnds();
    newCurrencyGovernance.votingEnds = currencyGovernanceContract.votingEnds();
    newCurrencyGovernance.revealEnds = currencyGovernanceContract.revealEnds();

    newCurrencyGovernance.defaultProposalMultiplier =
        currencyGovernanceContract.IDEMPOTENT_INFLATION_MULTIPLIER();
    newCurrencyGovernance.defaultProposalScore =
        currencyGovernanceContract.score(Address.fromString(NULL_ADDRESS));
    newCurrencyGovernance.defaultProposalEnacted = false;

    newCurrencyGovernance.save();

    const currencyTimerContract = CurrencyTimer.bind(event.address);
    // get contracts
    const policyContract = Policy.bind(currencyTimerContract.policy());
    const contracts = loadOrCreateContractAddresses(policyContract);
    // set current currencyGovernance contract
    // refresh policyVotes and policyProposals addresses
    contracts.currencyGovernance = currencyGovernanceAddress.toHexString();
    contracts.policyProposals = NULL_ADDRESS;
    contracts.policyVotes = NULL_ADDRESS;
    contracts.save();
}

export function handleNewLockup(event: NewLockup): void {
    // create new lockup entity
    const newLockup = new FundsLockup(event.params.addr.toHexString());
    newLockup.generation = event.params.generation.toString();

    const newLockupContract = LockupContract.bind(event.params.addr);
    newLockup.depositWindowDuration = newLockupContract.DEPOSIT_WINDOW();
    newLockup.depositWindowEndsAt = newLockupContract.depositWindowEnd();
    newLockup.duration = newLockupContract.duration();
    newLockup.interest = newLockupContract.interest();

    newLockup.save();

    // listen for new lockup's events
    LockupTemplate.create(event.params.addr);
}

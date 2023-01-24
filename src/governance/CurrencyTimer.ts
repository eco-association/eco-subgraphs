import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
    NewCurrencyGovernance,
    CurrencyTimer,
    NewLockup,
    NewInflation,
} from "../../generated/CurrencyTimer/CurrencyTimer";
import { Policy } from "../../generated/CurrencyTimer/Policy";
import { CurrencyGovernance as CurrencyGovernanceContract } from "../../generated/templates/CurrencyGovernance/CurrencyGovernance";
import { Lockup as LockupContract } from "../../generated/templates/Lockup/Lockup";
import { RandomInflation as RandomInflationContract } from "../../generated/templates/RandomInflation/RandomInflation";
import { InflationRootHashProposal as InflationRootHashProposalContract } from "../../generated/templates/InflationRootHashProposal/InflationRootHashProposal";

import {
    CurrencyGovernance as CurrencyGovernanceTemplate,
    Lockup as LockupTemplate,
    RandomInflation as RandomInflationTemplate,
    InflationRootHashProposal as InflationRootHashProposalTemplate,
} from "../../generated/templates";
import {
    ContractAddresses,
    CurrencyGovernance,
    FundsLockup,
    InflationRootHashProposal,
    RandomInflation,
    VDFVerifier,
} from "../../generated/schema";

import { NULL_ADDRESS } from "../constants";
import { loadOrCreateContractAddresses } from ".";
import { HistoryRecord } from "./entities/HistoryRecord";

// CurrencyTimer.NewCurrencyGovernance(addr, generation)
export function handleNewCurrencyGovernance(
    event: NewCurrencyGovernance
): void {
    // get the new address
    const currencyGovernanceAddress = event.params.addr;

    // subscribe to events from this generation's currencyGovernance contract
    CurrencyGovernanceTemplate.create(currencyGovernanceAddress);

    // create currencyGovernance entity
    const newCurrencyGovernance = new CurrencyGovernance(
        currencyGovernanceAddress.toHexString()
    );
    newCurrencyGovernance.generation = event.params.generation.toString();

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
    contracts.lockup = NULL_ADDRESS;
    contracts.randomInflation = NULL_ADDRESS;
    contracts.save();
}

// NewInflation(RandomInflation indexed addr, uint256 indexed generation)
export function handleNewInflation(event: NewInflation): void {
    // save inflation entity for the generation
    const newInflation = new RandomInflation(event.params.addr.toHexString());
    newInflation.generation = event.params.generation.toString();

    // also get data from contract
    const randomInflationContract = RandomInflationContract.bind(
        event.params.addr
    );
    newInflation.vdfVerifier = randomInflationContract
        .vdfVerifier()
        .toHexString();
    newInflation.inflationRootHashProposal = randomInflationContract
        .inflationRootHashProposal()
        .toHexString();
    newInflation.numRecipients = randomInflationContract.numRecipients();
    newInflation.reward = randomInflationContract.reward();
    newInflation.claimPeriodStarts =
        randomInflationContract.claimPeriodStarts();
    newInflation.CLAIM_PERIOD = randomInflationContract.CLAIM_PERIOD();
    newInflation.blockNumber = randomInflationContract.blockNumber();
    newInflation.save();
    RandomInflationTemplate.create(event.params.addr);

    const newInflationRootHashProposal = new InflationRootHashProposal(
        newInflation.inflationRootHashProposal
    );
    const inflationRootHashProposalContract =
        InflationRootHashProposalContract.bind(
            randomInflationContract.inflationRootHashProposal()
        );
    newInflationRootHashProposal.CHALLENGE_FEE =
        inflationRootHashProposalContract.CHALLENGE_FEE();
    newInflationRootHashProposal.PROPOSER_FEE =
        inflationRootHashProposalContract.PROPOSER_FEE();
    newInflationRootHashProposal.CHALLENGING_TIME =
        inflationRootHashProposalContract.CHALLENGING_TIME();
    newInflationRootHashProposal.CONTESTING_TIME =
        inflationRootHashProposalContract.CONTESTING_TIME();
    newInflationRootHashProposal.FEE_COLLECTION_TIME =
        inflationRootHashProposalContract.FEE_COLLECTION_TIME();
    newInflationRootHashProposal.accepted = false;
    newInflationRootHashProposal.save();
    InflationRootHashProposalTemplate.create(
        randomInflationContract.inflationRootHashProposal()
    );

    const newVDFVerifier = new VDFVerifier(newInflation.vdfVerifier);
    newVDFVerifier.save();

    // Create history record
    HistoryRecord.createInflationRecord(newInflation.id, event.block.timestamp);

    // add contract address
    const contracts = ContractAddresses.load("0");
    if (contracts) {
        contracts.randomInflation = event.params.addr.toHexString();
        contracts.save();
    }
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
    newLockup.totalLocked = BigInt.fromString("0");

    newLockup.save();

    // listen for new lockup's events
    LockupTemplate.create(event.params.addr);

    // Create history record
    HistoryRecord.createLockupRecord(
        "Lockup",
        newLockup.id,
        BigInt.zero(),
        event.block.timestamp,
        Address.zero()
    );

    // add contract address
    const contracts = ContractAddresses.load("0");
    if (contracts) {
        contracts.lockup = event.params.addr.toHexString();
        contracts.save();
    }
}

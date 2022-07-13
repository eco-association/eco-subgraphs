import { CurrencyGovernance as CurrencyGovernanceContract, ProposalCreation, ProposalRetraction, VoteCast, VoteResult, VoteReveal } from "../../generated/templates/CurrencyGovernance/CurrencyGovernance";

import { store } from "@graphprotocol/graph-ts";
import { MonetaryProposal, CurrencyGovernance, MonetaryCommit } from "../../generated/schema";


// ProposalCreation(address indexed trusteeAddress, 
//  uint256 _numberOfRecipients, 
//  uint256 _randomInflationReward, 
//  uint256 _lockupDuration,
//  uint256 _lockupInterest,
//  uint256 _inflationMultiplier)
export function handleProposalCreation(event: ProposalCreation): void {

    let id = event.address.toHexString() + "-" + event.params.trusteeAddress.toHexString();
    // load or create a new proposal
    let monetaryProposal = MonetaryProposal.load(id);
    
    if (!monetaryProposal) {
        monetaryProposal = new MonetaryProposal(id);
        
        // get generation
        let currencyGovernance = CurrencyGovernance.load(event.address.toHexString());
        if (currencyGovernance) {
            monetaryProposal.generation = currencyGovernance.generation;
        }
    }
    
    // set attributes
    monetaryProposal.trustee = event.params.trusteeAddress.toHexString();
    monetaryProposal.inflationMultiplier = event.params._inflationMultiplier;
    monetaryProposal.numberOfRecipients = event.params._numberOfRecipients;
    monetaryProposal.randomInflationReward = event.params._randomInflationReward;
    monetaryProposal.lockupDuration = event.params._lockupDuration;
    monetaryProposal.lockupInterest = event.params._lockupInterest;
    monetaryProposal.enacted = false;
    
    monetaryProposal.save();
}


// ProposalRetraction(address indexed trustee)
export function handleProposalRetraction(event: ProposalRetraction): void {
    let id = event.address.toHexString() + "-" + event.params.trustee.toHexString();
    // remove the proposal from the store
    store.remove("MonetaryProposal", id);
}


// CurrencyGovernance.VoteCast(address indexed trustee)
export function handleVoteCast(event: VoteCast): void {
    let id = event.address.toHexString() + "-" + event.params.trustee.toHexString();
    
    // load/create commit entity
    let commit = MonetaryCommit.load(id);

    if (!commit) {
        // new commit
        commit = new MonetaryCommit(id);

        commit.trustee = event.params.trustee.toHexString();
        commit.currencyGovernance = event.address.toHexString();
    }
    // bind contract
    let currencyGovernanceContract = CurrencyGovernanceContract.bind(event.address);

    // get commit hash
    commit.hash = currencyGovernanceContract.commitments(event.params.trustee);

    commit.save();
}


// CurrencyGovernance.VoteReveal(address indexed voter, address[] votes)
export function handleVoteReveal(event: VoteReveal): void {
    // TODO
}


// CurrencyGovernance.VoteResult(address indexed winner)
export function handleVoteResult(event: VoteResult): void {
    // TODO
}
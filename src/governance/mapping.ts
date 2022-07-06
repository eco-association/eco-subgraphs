import { PolicyDecisionStarted, TimedPolicies } from "../../generated/TimedPolicies/TimedPolicies";
import { Policy } from "../../generated/TimedPolicies/Policy";

import { PolicyProposals, Register, ProposalRefund, Support, Unsupport, SupportThresholdReached, VoteStart } from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyVotes, PolicyVoteCast, VoteCompleted } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "../../generated/templates/PolicyProposals/Proposal";

import { PolicyProposals as PolicyProposalsTemplate, PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";

import { CommunityProposal, CommunityProposalSupport, CommunityProposalVote, ContractAddresses, Generation, PolicyProposal, PolicyVote } from "../../generated/schema";

import { BigInt, store } from "@graphprotocol/graph-ts";
import { NULL_ADDRESS, ID_ECO, ID_ECOX, ID_TIMED_POLICIES } from "../constants";


function loadContractAddresses(): ContractAddresses | null {
    return ContractAddresses.load('0');
}

function loadOrCreateContractAddresses(policy: Policy): ContractAddresses {
    let contracts = loadContractAddresses();
    if (!contracts) {
        contracts = new ContractAddresses('0');
        contracts.policy = policy._address.toHexString();
        contracts.timedPolicies = policy.policyFor(ID_TIMED_POLICIES).toHexString();
        contracts.eco = policy.policyFor(ID_ECO).toHexString();
        contracts.ecox = policy.policyFor(ID_ECOX).toHexString();
    }
    return contracts;
}

// TimedPolicies.PolicyDesicionStarted(address contractAddress)
export function handlePolicyDesicionStarted(event: PolicyDecisionStarted): void {
    // get the new address
    let timedPoliciesContract = TimedPolicies.bind(event.address);

    let policyProposalsAddress = event.params.contractAddress;

    // create generation
    let generationNum = timedPoliciesContract.internalGeneration();

    let currentGeneration = new Generation(generationNum.toString());
    currentGeneration.save();

    // subscribe to events from this generation's PolicyProposals contract
    PolicyProposalsTemplate.create(policyProposalsAddress);
    let policyProposalsContract = PolicyProposals.bind(policyProposalsAddress);

    // create policyProposal entity
    let newPolicyProposals = new PolicyProposal(policyProposalsAddress.toHexString());
    newPolicyProposals.generation = generationNum.toString();
    newPolicyProposals.proposalEnds = policyProposalsContract.proposalEnds();
    let blockNumber = policyProposalsContract.blockNumber();
    newPolicyProposals.blockNumber = blockNumber;
    newPolicyProposals.totalVotingPower = policyProposalsContract.totalVotingPower(blockNumber);
    newPolicyProposals.save();

    // get contracts
    let policyContract = Policy.bind(timedPoliciesContract.policy());
    let contracts = loadOrCreateContractAddresses(policyContract);
    contracts.policyProposals = policyProposalsAddress.toHexString();
    contracts.policyVotes = NULL_ADDRESS;
    contracts.save();
    
}

// PolicyPropsals.Register(address proposer, address proposalAddress)
export function handleRegister(event: Register): void {
    // create a new proposal entity
    let proposal = new CommunityProposal(event.params.proposalAddress.toHexString());
    proposal.proposer = event.params.proposer;

    // get the policyProposals entity for the generation
    let policyProposal = PolicyProposal.load(event.address.toHexString());
    if (policyProposal) {
        proposal.generation = policyProposal.generation;
    }
    
    // get additional data from the proposal contract itself
    let proposalContract = Proposal.bind(event.params.proposalAddress);
    proposal.name = proposalContract.name();
    proposal.description = proposalContract.description();
    proposal.url = proposalContract.url();
    proposal.reachedSupportThreshold = false;
    proposal.refunded = false;
    proposal.totalSupportAmount = BigInt.fromString('0');

    proposal.save();
}

// PolicyProposals.Support(address supporter, address proposalAddress)
export function handleSupport(event: Support): void {
    let id = event.params.supporter.toHexString() + "-" + event.params.proposalAddress.toHexString();
    let support = new CommunityProposalSupport(id);
    support.supporter = event.params.supporter;
    support.proposal = event.params.proposalAddress.toHexString();
    support.policyProposal = event.address.toHexString();

    // get amount
    let policyProposalsContract = PolicyProposals.bind(event.address);
    let amount = policyProposalsContract.votingPower(event.params.supporter, policyProposalsContract.blockNumber());
    support.amount = amount;

    // update proposal total support amount
    let proposal = CommunityProposal.load(event.params.proposalAddress.toHexString());
    if (proposal) {
        proposal.totalSupportAmount = proposal.totalSupportAmount.plus(support.amount);
        proposal.save();
    }

    support.save();
}

// PolicyProposals.Unsupport(address unsupporter, address proposalAddress)
export function handleUnsupport(event: Unsupport): void {
    let id = event.params.unsupporter.toHexString() + "-" + event.params.proposalAddress.toHexString();
    store.remove('CommunityProposalSupport', id);

    // get amount
    let policyProposalsContract = PolicyProposals.bind(event.address);
    let amount = policyProposalsContract.votingPower(event.params.unsupporter, policyProposalsContract.blockNumber());

    // update proposal total support amount
    let proposal = CommunityProposal.load(event.params.proposalAddress.toHexString());
    if (proposal) {
        proposal.totalSupportAmount = proposal.totalSupportAmount.minus(amount);
        proposal.save();
    }
}

// PolicyPropsals.SupportThresholdReached(address proposalAddress)
export function handleSupportThresholdReached(event: SupportThresholdReached): void {
    let proposal = CommunityProposal.load(event.params.proposalAddress.toHexString());
    if (proposal) {
        proposal.reachedSupportThreshold = true;
        proposal.save();
    }
}

// PolicyProposals.ProposalRefund(address proposer, address proposalAddress)
export function handleProposalRefund(event: ProposalRefund): void {
    let proposal = CommunityProposal.load(event.params.proposalAddress.toHexString());
    if (proposal) {
        proposal.refunded = true;
        proposal.save();
    }
}

// PolicyPropsals.VoteStart(address contractAddress)
export function handleVoteStart(event: VoteStart): void {
    // subscribe to policyVotes events
    PolicyVotesTemplate.create(event.params.contractAddress);

    // new entity for vote
    let newPolicyVotes = new PolicyVote(event.params.contractAddress.toHexString());

    // get generation from policyProposals
    let policyProposal = PolicyProposal.load(event.address.toHexString());
    if (policyProposal) {
        newPolicyVotes.generation = policyProposal.generation;
    }

    // get the policyVotes contract and grab additonal arguments
    let policyVoteContract = PolicyVotes.bind(event.params.contractAddress);
    newPolicyVotes.voteEnds = policyVoteContract.voteEnds();
    newPolicyVotes.ENACTION_DELAY = policyVoteContract.ENACTION_DELAY();
    newPolicyVotes.blockNumber = policyVoteContract.blockNumber();
    newPolicyVotes.totalVotingPower = policyVoteContract.totalVotingPower(newPolicyVotes.blockNumber);
    newPolicyVotes.proposal = policyVoteContract.proposal().toHexString();
    newPolicyVotes.yesVoteAmount = BigInt.fromString('0');
    newPolicyVotes.totalVoteAmount = BigInt.fromString('0');

    // save entity
    newPolicyVotes.save();

    // update contracts with the new PolicyVotes address
    let contracts = loadContractAddresses();
    if (contracts) {
        contracts.policyVotes = event.params.contractAddress.toHexString();
        contracts.save();
    }
}


// PolicyVotes.PolicyVoteCast(address voter, bool vote, uint256 amount)
export function handlePolicyVoteCast(event: PolicyVoteCast): void {
    let vote = CommunityProposalVote.load(event.params.voter.toHexString());
    let policyVote = PolicyVote.load(event.address.toHexString());

    let voteAmount = event.params.amount;

    // check and set vote stats
    if (policyVote) {
        if (event.params.vote) {
            // add to yes amount if vote is for (whether vote is new or not)
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.plus(voteAmount);
        }
        else if (vote) {
            // if vote is against and vote is not new, remove from yes amount
            policyVote.yesVoteAmount = policyVote.yesVoteAmount.minus(voteAmount);
        }
        policyVote.save();
    }

    if (!vote) {
        // new vote
        vote = new CommunityProposalVote(event.params.voter.toHexString());
        vote.policyVote = event.address.toHexString();
    }

    vote.amount = voteAmount;
    vote.vote = event.params.vote;
    vote.save();
}

// PolicyVotes.VoteCompleted(Result result)
export function handleVoteCompleted(event: VoteCompleted): void {
    // get entity
    let policyVote = PolicyVote.load(event.address.toHexString());
    // determine and set result
    if (policyVote) {
        if (event.params.result === 0) {
            policyVote.result = "Accepted";
        }
        else if (event.params.result === 1) {
            policyVote.result = "Rejected";
        }
        else {
            policyVote.result = "Failed";
        }
        policyVote.save();
    }
}
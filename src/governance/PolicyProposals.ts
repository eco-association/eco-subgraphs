import { BigInt, store } from "@graphprotocol/graph-ts";
import {
    PolicyProposals,
    Register,
    ProposalRefund,
    Support,
    Unsupport,
    SupportThresholdReached,
    VoteStart,
} from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyVotes } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "../../generated/templates/PolicyProposals/Proposal";
import { PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";
import {
    CommunityProposal,
    CommunityProposalSupport,
    PolicyProposal,
    PolicyVote,
} from "../../generated/schema";


import { loadContractAddresses } from ".";

// PolicyPropsals.Register(address proposer, address proposalAddress)
export function handleRegister(event: Register): void {
    // create a new proposal entity
    const proposal = new CommunityProposal(
        event.params.proposalAddress.toHexString()
    );
    proposal.proposer = event.params.proposer;

    // get the policyProposals entity for the generation
    const policyProposal = PolicyProposal.load(event.address.toHexString());
    if (policyProposal) {
        proposal.generation = policyProposal.generation;
    }

    // get additional data from the proposal contract itself
    const proposalContract = Proposal.bind(event.params.proposalAddress);
    proposal.name = proposalContract.name();
    proposal.description = proposalContract.description();
    proposal.url = proposalContract.url();
    proposal.reachedSupportThreshold = false;
    proposal.refunded = false;
    proposal.totalSupportAmount = BigInt.fromString("0");

    proposal.save();
}

// PolicyProposals.Support(address supporter, address proposalAddress)
export function handleSupport(event: Support): void {
    const id =
        `${event.params.supporter.toHexString() 
        }-${ 
        event.params.proposalAddress.toHexString()}`;
    const support = new CommunityProposalSupport(id);
    support.supporter = event.params.supporter;
    support.proposal = event.params.proposalAddress.toHexString();
    support.policyProposal = event.address.toHexString();

    // get amount
    const policyProposalsContract = PolicyProposals.bind(event.address);
    const amount = policyProposalsContract.votingPower(
        event.params.supporter,
        policyProposalsContract.blockNumber()
    );
    support.amount = amount;

    // update proposal total support amount
    const proposal = CommunityProposal.load(
        event.params.proposalAddress.toHexString()
    );
    if (proposal) {
        proposal.totalSupportAmount = proposal.totalSupportAmount.plus(
            support.amount
        );
        proposal.save();
    }

    support.save();
}

// PolicyProposals.Unsupport(address unsupporter, address proposalAddress)
export function handleUnsupport(event: Unsupport): void {
    const id =
        `${event.params.unsupporter.toHexString() 
        }-${ 
        event.params.proposalAddress.toHexString()}`;
    store.remove("CommunityProposalSupport", id);

    // get amount
    const policyProposalsContract = PolicyProposals.bind(event.address);
    const amount = policyProposalsContract.votingPower(
        event.params.unsupporter,
        policyProposalsContract.blockNumber()
    );

    // update proposal total support amount
    const proposal = CommunityProposal.load(
        event.params.proposalAddress.toHexString()
    );
    if (proposal) {
        proposal.totalSupportAmount = proposal.totalSupportAmount.minus(amount);
        proposal.save();
    }
}

// PolicyPropsals.SupportThresholdReached(address proposalAddress)
export function handleSupportThresholdReached(
    event: SupportThresholdReached
): void {
    const proposal = CommunityProposal.load(
        event.params.proposalAddress.toHexString()
    );
    if (proposal) {
        proposal.reachedSupportThreshold = true;
        proposal.save();
    }
}

// PolicyProposals.ProposalRefund(address proposer, address proposalAddress)
export function handleProposalRefund(event: ProposalRefund): void {
    const proposal = CommunityProposal.load(
        event.params.proposalAddress.toHexString()
    );
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
    const newPolicyVotes = new PolicyVote(
        event.params.contractAddress.toHexString()
    );

    // get generation from policyProposals
    const policyProposal = PolicyProposal.load(event.address.toHexString());
    if (policyProposal) {
        newPolicyVotes.generation = policyProposal.generation;
    }

    // get the policyVotes contract and grab additonal arguments
    const policyVoteContract = PolicyVotes.bind(event.params.contractAddress);
    newPolicyVotes.voteEnds = policyVoteContract.voteEnds();
    newPolicyVotes.ENACTION_DELAY = policyVoteContract.ENACTION_DELAY();
    newPolicyVotes.blockNumber = policyVoteContract.blockNumber();
    newPolicyVotes.totalVotingPower = policyVoteContract.totalVotingPower(
        newPolicyVotes.blockNumber
    );
    newPolicyVotes.proposal = policyVoteContract.proposal().toHexString();
    newPolicyVotes.yesVoteAmount = BigInt.fromString("0");
    newPolicyVotes.totalVoteAmount = BigInt.fromString("0");

    // save entity
    newPolicyVotes.save();

    // update contracts with the new PolicyVotes address
    const contracts = loadContractAddresses();
    if (contracts) {
        contracts.policyVotes = event.params.contractAddress.toHexString();
        contracts.save();
    }
}

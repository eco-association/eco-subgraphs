import { BigInt } from "@graphprotocol/graph-ts";
import {
    ProposalRefund as ProposalRefundEvent,
    Register as RegisterEvent,
    Support as SupportEvent,
    SupportThresholdReached as SupportThresholdReachedEvent,
    Unsupport as UnsupportEvent,
    VoteStart as VoteStartEvent,
} from "../../generated/templates/PolicyProposals/PolicyProposals";
import { PolicyVotes } from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal as ProposalContract } from "../../generated/templates/PolicyProposals/Proposal";
import { PolicyVotes as PolicyVotesTemplate } from "../../generated/templates";
import { PolicyProposal, PolicyVote } from "../../generated/schema";
import { Proposal } from "./entities/Proposal";
import { loadContractAddresses } from ".";

// PolicyProposals.Register(address proposer, address proposalAddress)
export function handleRegister(event: RegisterEvent): void {
    // get data from the proposal contract itself
    const proposalContract = ProposalContract.bind(
        event.params.proposalAddress
    );
    const nameRequest = proposalContract.try_name();
    const descriptionRequest = proposalContract.try_description();
    const urlRequest = proposalContract.try_url();

    // Skip proposal if it's not valid
    if (
        !nameRequest.reverted &&
        !descriptionRequest.reverted &&
        !urlRequest.reverted
    ) {
        const proposal = Proposal.load(event.params.proposalAddress);

        proposal.register(
            event.params.proposer,
            nameRequest.value,
            descriptionRequest.value,
            urlRequest.value
        );

        // get the policyProposals entity for the generation
        const policyProposal = PolicyProposal.load(event.address.toHexString());
        if (policyProposal) proposal.setGeneration(policyProposal.generation);
        proposal.save();
        proposal.historyRecord("ProposalSubmitted", event.block.timestamp);
    }
}

// PolicyProposals.Support(address supporter, address proposalAddress)
export function handleSupport(event: SupportEvent): void {
    const proposal = Proposal.load(event.params.proposalAddress);
    proposal.support(event.params.supporter, event.address);
    proposal.save();
    proposal.historyRecord("ProposalSupported", event.block.timestamp);
}

// PolicyProposals.Unsupport(address unsupporter, address proposalAddress)
export function handleUnsupport(event: UnsupportEvent): void {
    const proposal = Proposal.load(event.params.proposalAddress);
    proposal.unsupport(event.params.unsupporter, event.address);
    proposal.save();
    proposal.historyRecord("ProposalUnsupported", event.block.timestamp);
}

// PolicyProposals.SupportThresholdReached(address proposalAddress)
export function handleSupportThresholdReached(
    event: SupportThresholdReachedEvent
): void {
    const proposal = Proposal.load(event.params.proposalAddress);
    proposal.thresholdReached();
    proposal.save();

    proposal.historyRecord("ProposalQuorum", event.block.timestamp);
}

// PolicyProposals.ProposalRefund(address proposer, address proposalAddress)
export function handleProposalRefund(event: ProposalRefundEvent): void {
    const proposal = Proposal.load(event.params.proposalAddress);
    proposal.refunded();
    proposal.save();
}

// PolicyProposals.VoteStart(address contractAddress)
export function handleVoteStart(event: VoteStartEvent): void {
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

    // get the policyVotes contract and grab additional arguments
    const policyVoteContract = PolicyVotes.bind(event.params.contractAddress);
    newPolicyVotes.voteEnds = policyVoteContract.voteEnds();
    newPolicyVotes.ENACTION_DELAY = policyVoteContract.ENACTION_DELAY();
    newPolicyVotes.blockNumber = policyVoteContract.blockNumber();
    newPolicyVotes.totalVotingPower = policyVoteContract.totalVotingPower(
        newPolicyVotes.blockNumber
    );
    const proposalId = policyVoteContract.proposal();
    newPolicyVotes.proposal = proposalId.toHexString();
    newPolicyVotes.yesVoteAmount = BigInt.zero();
    newPolicyVotes.totalVoteAmount = BigInt.zero();

    // save entity
    newPolicyVotes.save();

    const proposal = Proposal.load(proposalId);
    proposal.historyRecord("ProposalVoting", event.block.timestamp);

    // update contracts with the new PolicyVotes address
    const contracts = loadContractAddresses();
    if (contracts) {
        contracts.policyVotes = event.params.contractAddress.toHexString();
        contracts.save();
    }
}

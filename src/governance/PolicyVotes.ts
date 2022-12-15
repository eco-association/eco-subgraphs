import { Address } from "@graphprotocol/graph-ts/index";
import { BigInt } from "@graphprotocol/graph-ts";
import { PolicyVote } from "../../generated/schema";
import {
    PolicyVote as PolicyVoteEvent,
    VoteCompletion,
} from "../../generated/templates/PolicyVotes/PolicyVotes";
import { Proposal } from "./entities/Proposal";
import { VoteManager } from "./entities/VoteManager";
import { HistoryRecord } from "./entities/HistoryRecord";

// PolicyVotes.PolicyVote(address indexed voter, uint256 votesYes, uint256 votesNo)
export function handlePolicyVote(event: PolicyVoteEvent): void {
    const policy = PolicyVote.load(event.address.toHexString());
    if (policy) {
        const voteManager = new VoteManager(event.params.voter, policy);
        voteManager.resetVote();
        voteManager.voteSplit(event.params.votesYes, event.params.votesNo);
        voteManager.checkMajority(event.block.timestamp);
        voteManager.save();

        if (event.params.votesYes.gt(event.params.votesNo)) {
            HistoryRecord.createProposalRecord(
                "ProposalVoteFor",
                policy.proposal,
                event.block.timestamp,
                event.params.voter
            );
        } else if (event.params.votesNo.gt(BigInt.zero())) {
            HistoryRecord.createProposalRecord(
                "ProposalVoteAgainst",
                policy.proposal,
                event.block.timestamp,
                event.params.voter
            );
        }
    }
}

enum VoteResult {
    Accepted,
    Rejected,
    Failed,
}

function getResult(result: VoteResult): string {
    switch (result) {
        case VoteResult.Accepted:
            return "Accepted";
        case VoteResult.Rejected:
            return "Rejected";
        case VoteResult.Failed:
        default:
            return "Failed";
    }
}

// PolicyVotes.VoteCompletion(Result result)
export function handleVoteCompletion(event: VoteCompletion): void {
    const policyVote = PolicyVote.load(event.address.toHexString());
    if (policyVote) {
        policyVote.result = getResult(event.params.result);
        policyVote.save();

        Proposal.load(policyVote.proposal).historyRecord(
            "ProposalResult",
            event.block.timestamp,
            Address.zero()
        );
    }
}

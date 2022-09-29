import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { CommunityProposalVote, PolicyVote } from "../../generated/schema";
import {
    PolicyVote as PolicyVoteEvent,
    PolicySplitVoteCast,
    VoteCompletion,
} from "../../generated/templates/PolicyVotes/PolicyVotes";

class VoteManager {
    private readonly vote: CommunityProposalVote;

    private readonly policy: PolicyVote;

    static generateVoteId(voter: Bytes, policyVoteAddress: Bytes): string {
        return `${voter.toHexString()}-${policyVoteAddress.toHexString()}`;
    }

    static loadOrCreateVote(
        voter: Bytes,
        policyVoteAddress: Bytes
    ): CommunityProposalVote {
        const voteId = VoteManager.generateVoteId(voter, policyVoteAddress);
        let vote = CommunityProposalVote.load(voteId);
        if (!vote) {
            // create new vote entity
            vote = new CommunityProposalVote(voteId);
            vote.voter = voter;
            vote.policyVote = policyVoteAddress.toHexString();
            vote.totalAmount = BigInt.zero();
            vote.yesAmount = BigInt.zero();
        }
        return vote;
    }

    constructor(voter: Bytes, policy: PolicyVote) {
        this.policy = policy;
        this.vote = VoteManager.loadOrCreateVote(
            voter,
            Bytes.fromHexString(policy.id)
        );
    }

    public voteFor(amount: BigInt): void {
        // set vote values and policyVote values
        this.policy.totalVoteAmount = this.policy.totalVoteAmount.plus(amount);
        this.policy.yesVoteAmount = this.policy.yesVoteAmount.plus(amount);
        this.vote.yesAmount = amount;
        this.vote.totalAmount = amount;
    }

    public voteAgainst(amount: BigInt): void {
        // set vote values and policyVote values
        this.policy.totalVoteAmount = this.policy.totalVoteAmount.plus(amount);
        this.vote.yesAmount = BigInt.zero();
        this.vote.totalAmount = amount;
    }

    public voteSplit(forVotes: BigInt, againstVotes: BigInt): void {
        this.voteFor(forVotes);
        this.voteAgainst(againstVotes);
        this.vote.totalAmount = forVotes.plus(againstVotes);
    }

    public save(): void {
        this.policy.save();
        this.vote.save();
    }

    public resetVote(): void {
        // vote is not new, reset past amounts before setting new values
        this.policy.totalVoteAmount = this.policy.totalVoteAmount.minus(
            this.vote.totalAmount
        );
        this.policy.yesVoteAmount = this.policy.yesVoteAmount.minus(
            this.vote.yesAmount
        );
    }

    private hasReachedMajority(): boolean {
        return this.policy.totalVotingPower
            .div(BigInt.fromI32(2))
            .lt(this.policy.yesVoteAmount);
    }

    public checkMajority(currentTime: BigInt): void {
        if (this.hasReachedMajority()) {
            this.policy.majorityReachedAt = currentTime;
        } else {
            this.policy.majorityReachedAt = null;
        }
    }
}

// PolicyVotes.PolicyVoteCast(address voter, bool vote, uint256 amount)
export function handlePolicyVote(event: PolicyVoteEvent): void {
    const policy = PolicyVote.load(event.address.toHexString());

    if (policy) {
        const voteManager = new VoteManager(event.params.voter, policy);
        voteManager.resetVote();
        if (event.params.vote) {
            voteManager.voteFor(event.params.amount);
        } else {
            voteManager.voteAgainst(event.params.amount);
        }
        voteManager.checkMajority(event.block.timestamp);
        voteManager.save();
    }
}

// PolicyVotes.PolicySplitVoteCast(address indexed voter, uint256 votesYes, uint256 votesNo)
export function handlePolicySplitVoteCast(event: PolicySplitVoteCast): void {
    const policy = PolicyVote.load(event.address.toHexString());
    if (policy) {
        const voteManager = new VoteManager(event.params.voter, policy);
        voteManager.resetVote();
        voteManager.voteSplit(event.params.votesYes, event.params.votesNo);
        voteManager.checkMajority(event.block.timestamp);
        voteManager.save();
    }
}

// PolicyVotes.VoteCompleted(Result result)
export function handleVoteCompletion(event: VoteCompletion): void {
    // get entity
    const policyVote = PolicyVote.load(event.address.toHexString());
    // determine and set result
    if (policyVote) {
        if (event.params.result === 0) {
            policyVote.result = "Accepted";
        } else if (event.params.result === 1) {
            policyVote.result = "Rejected";
        } else {
            policyVote.result = "Failed";
        }
        policyVote.save();
    }
}

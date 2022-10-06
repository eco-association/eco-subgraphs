import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts/index";
import {
    ActivityRecord,
    CommunityProposal,
    CommunityProposalSupport,
} from "../../../generated/schema";
import { PolicyProposals } from "../../../generated/templates/PolicyProposals/PolicyProposals";

export class Proposal {
    private proposal: CommunityProposal;

    constructor(address: Bytes) {
        let proposal = CommunityProposal.load(address.toHexString());
        if (!proposal) {
            proposal = new CommunityProposal(address.toHexString());
            proposal.refunded = false;
            proposal.reachedSupportThreshold = false;
            proposal.totalSupportAmount = BigInt.zero();
        }
        this.proposal = proposal;
    }

    public static load(address: Bytes): Proposal {
        return new Proposal(address);
    }

    public static getVoterVotingPower(
        address: Address,
        voter: Address
    ): BigInt {
        const contract = PolicyProposals.bind(address);
        return contract.votingPower(voter, contract.blockNumber());
    }

    private static generateSupportId(
        address: string,
        supporter: Bytes
    ): string {
        return `${supporter.toHexString()}-${address}`;
    }

    private static generateHistoryRecordId(
        type: string,
        proposal: string,
        timestamp: BigInt
    ): string {
        return `${type}-${proposal}-${timestamp.toString()}`;
    }

    register(
        proposer: Bytes,
        name: string,
        description: string,
        url: string
    ): void {
        this.proposal.proposer = proposer;
        this.proposal.url = url;
        this.proposal.name = name;
        this.proposal.description = description;
        // Default values
        this.proposal.refunded = false;
        this.proposal.reachedSupportThreshold = false;
        this.proposal.totalSupportAmount = BigInt.zero();
    }

    setGeneration(generation: string): void {
        this.proposal.generation = generation;
    }

    support(supporter: Address, policy: Address): void {
        const support = new CommunityProposalSupport(
            Proposal.generateSupportId(this.proposal.id, supporter)
        );
        support.amount = Proposal.getVoterVotingPower(policy, supporter);
        support.supporter = supporter;
        support.proposal = this.proposal.id;
        support.policyProposal = policy.toHexString();
        this.proposal.totalSupportAmount =
            this.proposal.totalSupportAmount.plus(support.amount);
        support.save();
    }

    unsupport(unsupporter: Address, policy: Address): void {
        store.remove(
            "CommunityProposalSupport",
            Proposal.generateSupportId(this.proposal.id, unsupporter)
        );
        const amount = Proposal.getVoterVotingPower(policy, unsupporter);
        this.proposal.totalSupportAmount =
            this.proposal.totalSupportAmount.minus(amount);
    }

    thresholdReached(): void {
        this.proposal.reachedSupportThreshold = true;
    }

    refunded(): void {
        this.proposal.refunded = true;
    }

    save(): void {
        this.proposal.save();
    }

    historyRecord(type: string, timestamp: BigInt): void {
        const id = Proposal.generateHistoryRecordId(
            type,
            this.proposal.id,
            timestamp
        );
        const record = new ActivityRecord(id);
        record.type = type;
        record.timestamp = timestamp;
        record.communityProposal = this.proposal.id;
        record.save();
    }
}

import { Address, BigInt, Bytes, store } from "@graphprotocol/graph-ts/index";
import {
    CommunityProposal,
    CommunityProposalSupport,
    PolicyProposal,
} from "../../../generated/schema";
import { PolicyProposals } from "../../../generated/templates/PolicyProposals/PolicyProposals";
import { HistoryRecord } from "./HistoryRecord";

export class Proposal {
    private proposal: CommunityProposal;

    constructor(id: string) {
        let proposal = CommunityProposal.load(id);
        if (!proposal) {
            proposal = new CommunityProposal(id);
            proposal.refunded = false;
            proposal.reachedSupportThreshold = false;
            proposal.totalSupportAmount = BigInt.zero();
        }
        this.proposal = proposal;
    }

    public static load(id: string): Proposal {
        return new Proposal(id);
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
        supporter: Bytes,
        policy: Bytes
    ): string {
        return `${supporter.toHexString()}-${address}-${policy.toHexString()}`;
    }

    static generateId(address: Bytes, proposal: Bytes): string {
        return `${address.toHexString()}-${proposal.toHexString()}`;
    }

    register(
        address: Bytes,
        proposer: Bytes,
        name: string,
        description: string,
        url: string,
        policy: PolicyProposal
    ): void {
        this.proposal.address = address;
        this.proposal.proposer = proposer;
        this.proposal.url = url;
        this.proposal.name = name;
        this.proposal.description = description;
        this.proposal.generation = policy.generation;
        this.proposal.generationNumber = BigInt.fromString(policy.generation);
        // Default values
        this.proposal.refunded = false;
        this.proposal.reachedSupportThreshold = false;
        this.proposal.totalSupportAmount = BigInt.zero();
    }

    support(supporter: Address, policy: Address, timestamp: BigInt): void {
        const support = new CommunityProposalSupport(
            Proposal.generateSupportId(this.proposal.id, supporter, policy)
        );
        support.amount = Proposal.getVoterVotingPower(policy, supporter);
        support.supporter = supporter;
        support.createdAt = timestamp;
        support.proposal = this.proposal.id;
        support.policyProposal = policy.toHexString();
        this.proposal.totalSupportAmount =
            this.proposal.totalSupportAmount.plus(support.amount);
        support.save();
    }

    unsupport(unsupporter: Address, policy: Address): void {
        store.remove(
            "CommunityProposalSupport",
            Proposal.generateSupportId(this.proposal.id, unsupporter, policy)
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
        HistoryRecord.createProposalRecord(type, this.proposal.id, timestamp);
    }
}

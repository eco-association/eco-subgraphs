import { Address, BigInt } from "@graphprotocol/graph-ts/index";
import { ActivityRecord } from "../../../generated/schema";

export class HistoryRecord {
    private readonly id: string;

    private readonly record: ActivityRecord;

    public static generateId(
        type: string,
        id: string,
        timestamp: BigInt
    ): string {
        return `${type}-${id}-${timestamp.toString()}`;
    }

    public static createProposalRecord(
        type: string,
        id: string,
        timestamp: BigInt,
        triggeredBy: Address
    ): void {
        new HistoryRecord(type, id, timestamp, triggeredBy).proposal();
    }

    public static createInflationRecord(id: string, timestamp: BigInt): void {
        new HistoryRecord(
            "RandomInflation",
            id,
            timestamp,
            Address.zero()
        ).randomInflation();
    }

    public static createRandomInflationClaimRecord(
        id: string,
        timestamp: BigInt,
        triggeredBy: Address
    ): void {
        new HistoryRecord(
            "RandomInflationClaim",
            id,
            timestamp,
            triggeredBy
        ).randomInflationClaim();
    }

    public static createLockupRecord(
        type: string,
        id: string,
        amount: BigInt,
        timestamp: BigInt,
        triggeredBy: Address
    ): void {
        new HistoryRecord(type, id, timestamp, triggeredBy).lockupDeposit(
            amount
        );
    }

    public static createGenerationRecord(id: string, timestamp: BigInt): void {
        new HistoryRecord(
            "Generation",
            id,
            timestamp,
            Address.zero()
        ).generation();
    }

    constructor(
        type: string,
        id: string,
        timestamp: BigInt,
        triggeredBy: Address
    ) {
        this.id = id;
        this.record = new ActivityRecord(
            HistoryRecord.generateId(type, id, timestamp)
        );
        this.record.type = type;
        this.record.amount = BigInt.zero();
        this.record.timestamp = timestamp;
        if (!triggeredBy.equals(Address.zero())) {
            this.record.triggeredBy = triggeredBy.toHexString();
        }
    }

    public proposal(): void {
        this.record.communityProposal = this.id;
        this.save();
    }

    public randomInflation(): void {
        this.record.randomInflation = this.id;
        this.save();
    }

    public randomInflationClaim(): void {
        this.record.randomInflationClaim = this.id;
        this.save();
    }

    public lockup(): void {
        this.record.fundsLockup = this.id;
        this.save();
    }

    public lockupDeposit(amount: BigInt): void {
        this.record.lockupDeposit = this.id;
        this.record.amount = amount;
        this.save();
    }

    public generation(): void {
        this.record.generation = this.id;
        this.save();
    }

    public save(): void {
        this.record.save();
    }
}

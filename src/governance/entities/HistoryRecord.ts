import { BigInt } from "@graphprotocol/graph-ts/index";
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
        timestamp: BigInt
    ): void {
        new HistoryRecord(type, id, timestamp).policy();
    }

    public static createInflationRecord(id: string, timestamp: BigInt): void {
        new HistoryRecord("RandomInflation", id, timestamp).inflation();
    }

    public static createLockupRecord(id: string, timestamp: BigInt): void {
        new HistoryRecord("Lockup", id, timestamp).lockup();
    }

    public static createGenerationRecord(id: string, timestamp: BigInt): void {
        new HistoryRecord("Generation", id, timestamp).generation();
    }

    constructor(type: string, id: string, timestamp: BigInt) {
        this.id = id;
        this.record = new ActivityRecord(
            HistoryRecord.generateId(type, id, timestamp)
        );
        this.record.type = type;
        this.record.timestamp = timestamp;
    }

    public policy(): void {
        this.record.communityProposal = this.id;
        this.record.save();
    }

    public inflation(): void {
        this.record.randomInflation = this.id;
        this.record.save();
    }

    public lockup(): void {
        this.record.fundsLockup = this.id;
        this.record.save();
    }

    public generation(): void {
        this.record.generation = this.id;
        this.record.save();
    }
}

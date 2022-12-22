import { BigInt } from "@graphprotocol/graph-ts";
import { VotingPower as VotingPowerEntity } from "../../../generated/schema";

export class VotingPower {
    private static generateId(
        token: string,
        address: string,
        block: BigInt
    ): string {
        return `${token}-${address}-${block.toString()}`;
    }

    public static setEco(
        address: string,
        blockNumber: BigInt,
        amount: BigInt
    ): void {
        VotingPower.create("eco", address, blockNumber, amount);
    }

    public static setSEcoX(
        address: string,
        blockNumber: BigInt,
        amount: BigInt
    ): void {
        VotingPower.create("sEcox", address, blockNumber, amount);
    }

    public static create(
        token: string,
        address: string,
        block: BigInt,
        amount: BigInt
    ): void {
        const votingPower = new VotingPowerEntity(
            VotingPower.generateId(token, address, block)
        );
        votingPower.token = token;
        votingPower.account = address;
        votingPower.value = amount;
        votingPower.blockNumber = block;
        votingPower.save();
    }
}

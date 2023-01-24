import { Address, BigInt } from "@graphprotocol/graph-ts/index";
import {
    Deposit,
    Lockup as LockupContract,
    Withdrawal,
} from "../../generated/templates/Lockup/Lockup";

import { FundsLockup, FundsLockupDeposit } from "../../generated/schema";
import { loadOrCreateAccount } from "../currency";
import { HistoryRecord } from "./entities/HistoryRecord";

function getLockupDepositId(
    contract: Address,
    depositor: Address,
    index: BigInt
): string {
    return `${contract.toHexString()}-${depositor.toHexString()}-${index.toString()}`;
}

function getLockupDeposit(
    contract: Address,
    depositor: Address,
    index: BigInt = BigInt.zero()
): FundsLockupDeposit {
    const id = getLockupDepositId(contract, depositor, index);
    let deposit = FundsLockupDeposit.load(id);

    if (!deposit) {
        deposit = new FundsLockupDeposit(id);

        const account = loadOrCreateAccount(depositor);
        // associate account
        deposit.account = account.id;
        // associate lockup
        deposit.lockup = contract.toHexString();
    } else if (deposit.withdrawnAt) {
        return getLockupDeposit(
            contract,
            depositor,
            index.plus(BigInt.fromString("1"))
        );
    }

    return deposit;
}

// Lockup.Deposit(address indexed to, uint256 amount)
export function handleDeposit(event: Deposit): void {
    const deposit = getLockupDeposit(event.address, event.params.to);

    // get deposit record struct
    const lockupContract = LockupContract.bind(event.address);
    const contractDeposit = lockupContract.deposits(event.params.to);

    deposit.withdrawnAt = null;

    // gonsDepositAmount
    deposit.amount = contractDeposit.value0;
    // ecoDepositReward
    deposit.reward = contractDeposit.value1;
    // delegate
    deposit.delegate = contractDeposit.value2.toHexString();

    deposit.save();

    // Create history record
    HistoryRecord.createLockupRecord(
        "LockupDeposit",
        deposit.id,
        event.params.amount,
        event.block.timestamp,
        event.params.to
    );

    // update total locked
    const fundsLockup = FundsLockup.load(event.address.toHexString());
    if (fundsLockup) {
        fundsLockup.totalLocked = fundsLockup.totalLocked.plus(deposit.amount);
        fundsLockup.save();
    }
}

// Lockup.Withdrawal(address indexed to, uint256 amount)
export function handleWithdrawal(event: Withdrawal): void {
    const deposit = getLockupDeposit(event.address, event.params.to);

    if (deposit) {
        // update total locked
        const fundsLockup = FundsLockup.load(event.address.toHexString());
        if (fundsLockup) {
            fundsLockup.totalLocked = fundsLockup.totalLocked.minus(
                deposit.amount
            );
            fundsLockup.save();
        }

        deposit.withdrawnAt = event.block.timestamp;
        deposit.save();
    }
}

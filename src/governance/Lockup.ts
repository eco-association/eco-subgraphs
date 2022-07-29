import { store } from "@graphprotocol/graph-ts";

import {
    Deposit,
    Withdrawal,
    Lockup as LockupContract
} from "../../generated/templates/Lockup/Lockup";

import { FundsLockup, FundsLockupDeposit } from "../../generated/schema";
import { loadOrCreateAccount } from "../currency";

// Lockup.Deposit(address indexed to, uint256 amount)
export function handleDeposit(event: Deposit): void {
    const id = `${event.address.toHexString()}-${event.params.to.toHexString()}`;
    let deposit = FundsLockupDeposit.load(id);

    if (!deposit) {
        deposit = new FundsLockupDeposit(id);

        const account = loadOrCreateAccount(event.params.to);
        // associate account
        deposit.account = account.id;
        // associate lockup
        deposit.lockup = event.address.toHexString();
    }

    // get deposit record struct
    const lockupContract = LockupContract.bind(event.address);
    const contractDeposit = lockupContract.deposits(event.params.to);

    // gonsDepositAmount
    deposit.amount = contractDeposit.value0;
    // ecoDepositReward
    deposit.reward = contractDeposit.value1;
    // lockupEnd
    deposit.lockupEndsAt = contractDeposit.value2;
    // delegate
    const delegateAccount = loadOrCreateAccount(contractDeposit.value3);
    deposit.delegate = delegateAccount.id;

    deposit.save();

    // update total locked
    const fundsLockup = FundsLockup.load(event.address.toHexString());
    if (fundsLockup) {
        fundsLockup.totalLocked = fundsLockup.totalLocked.plus(deposit.amount);
        fundsLockup.save();
    }
}

// Lockup.Withdrawal(address indexed to, uint256 amount)
export function handleWithdrawal(event: Withdrawal): void {
    const id = `${event.address.toHexString()}-${event.params.to.toHexString()}`;

    const deposit = FundsLockupDeposit.load(id);

    if (deposit) {
        // update total locked
        const fundsLockup = FundsLockup.load(event.address.toHexString());
        if (fundsLockup) {
            fundsLockup.totalLocked = fundsLockup.totalLocked.minus(
                deposit.amount
            );
            fundsLockup.save();
        }
        // withdrawal => delete the deposit
        store.remove("FundsLockupDeposit", id);
    }
}

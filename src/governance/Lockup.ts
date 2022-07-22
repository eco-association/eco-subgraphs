import { Deposit, Withdrawal, Lockup as LockupContract } from "../../generated/templates/Lockup/Lockup";

import { FundsLockupDeposit } from "../../generated/schema";
import { loadOrCreateAccount } from "../currency";

import { store } from "@graphprotocol/graph-ts";

// Lockup.Deposit(address indexed to, uint256 amount)
export function handleDeposit(event: Deposit): void {
    const id = event.address.toHexString() + "-" + event.params.to.toHexString();
    let deposit = FundsLockupDeposit.load(id);

    if (!deposit) {
        deposit = new FundsLockupDeposit(id);

        const account = loadOrCreateAccount(event.params.to.toHexString());
        // associate account
        deposit.account = account.id;
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
    const delegateAccount = loadOrCreateAccount(contractDeposit.value3.toHexString());
    deposit.delegate = delegateAccount.id;

    deposit.save();
}

// Lockup.Withdrawal(address indexed to, uint256 amount)
export function handleWithdrawal(event: Withdrawal): void {
    const id = event.address.toHexString() + "-" + event.params.to.toHexString();

    // withdrawal => delete the deposit
    store.remove("FundsLockupDeposit", id);
}
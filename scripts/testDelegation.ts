import axios from "axios";
import { BigNumber } from "@ethersproject/bignumber";

const DEBUG = 0;
const DEBUG_ADDRESS = "0xbcb92a1235869ed3c642337d68499297d2e058a8";
const DEBUG_BLOCK = 16419368;

const SUBGRAPH_URL =
    // "https://api.thegraph.com/subgraphs/name/ecographs/the-eco-currency-subgraphs";
    "https://api.thegraph.com/subgraphs/name/carlosfebres/policy";
// "https://api.thegraph.com/subgraphs/id/QmR2JHwnaKVRsB5gnzpbaT9WL7MRLtjQ9Lz1aCkvpu8Qbi";

const ACCOUNTS_QUERY = `
    query ACCOUNTS_QUERY ($skip: Int!) {
      accounts(first:100, skip: $skip) {
        address: id
        historicalECOBalances(orderBy: blockNumber, orderDirection: desc) {
          value
          blockNumber
        }
        historicalsECOxBalances(orderBy: blockNumber, orderDirection: desc) {
          value
          blockNumber
        }
        historicalVotingPowers(orderBy: blockNumber, orderDirection: desc) {
          token {
            id
          }
          value
          blockNumber
        }
        tokenDelegatees(orderBy: blockStarted, orderDirection: desc) {
          token {
            id
          }
          amount
          blockStarted
          blockEnded
        }
        tokenDelegators(orderBy: blockStarted, orderDirection: desc) {
          token {
            id
          }
          amount
          blockStarted
          blockEnded
        }
      }
      inflationMultipliers(orderBy: blockNumber, orderDirection: desc) {
        value
        blockNumber
      }
    }
`;

enum Token {
    ECO = "eco",
    ECOx = "sEcox",
}

interface BalanceRecord {
    token: Token;
    value: BigNumber;
    blockNumber: number;
}

interface DelegationRecord {
    token: Token;
    amount: BigNumber;
    blockStarted: number;
    blockEnded: number | null;
}

interface Account {
    address: string;
    historicalECOBalances: BalanceRecord[];
    historicalsECOxBalances: BalanceRecord[];
    historicalVotingPowers: BalanceRecord[];
    tokenDelegatees: DelegationRecord[];
    tokenDelegators: DelegationRecord[];
}

function execQuery(
    url: string,
    query: string,
    variables: { [p: string]: string | number } = {}
) {
    return axios.post(
        url,
        { query, variables },
        {
            headers: { "Content-Type": "application/json" },
        }
    );
}

function log(...params) {
    DEBUG && console.log(...params);
}

function formatBalanceRecord(token: Token, record: any): BalanceRecord {
    return {
        token,
        value: BigNumber.from(record.value),
        blockNumber: parseInt(record.blockNumber),
    };
}

function formatVotingRecord(record: any): BalanceRecord {
    return formatBalanceRecord(record.token.id, record);
}

function formatDelegationRecord(record: any): DelegationRecord {
    return {
        token: record.token.id,
        amount: BigNumber.from(record.amount),
        blockStarted: parseInt(record.blockStarted),
        blockEnded: record.blockEnded && parseInt(record.blockEnded),
    };
}

async function fetchData(skip = 0): Promise<{
    accounts: Account[];
    multipliers: BalanceRecord[];
}> {
    console.log(`Fetching records ${skip}-${skip + 100}...`);

    const result: {
        data: { data: { accounts: any[]; inflationMultipliers: any[] } };
    } = await execQuery(SUBGRAPH_URL, ACCOUNTS_QUERY, { skip });

    let accounts: Account[] = result.data.data.accounts.map((account) => ({
        address: account.address,
        historicalECOBalances: account.historicalECOBalances.map(
            (record: any) => formatBalanceRecord(Token.ECO, record)
        ),
        historicalsECOxBalances: account.historicalsECOxBalances.map(
            (record: any) => formatBalanceRecord(Token.ECOx, record)
        ),
        historicalVotingPowers:
            account.historicalVotingPowers.map(formatVotingRecord),
        tokenDelegatees: account.tokenDelegatees.map(formatDelegationRecord),
        tokenDelegators: account.tokenDelegators.map(formatDelegationRecord),
    }));
    const multipliers = result.data.data.inflationMultipliers.map(
        (record: any) => formatBalanceRecord(Token.ECO, record)
    );

    if (accounts.length === 100) {
        accounts = accounts.concat(...(await fetchData(skip + 100)).accounts);
    }

    return { accounts, multipliers };
}

function getPastBalance(
    balances: BalanceRecord[],
    blockNumber: number,
    base = BigNumber.from(0)
): BigNumber {
    for (const record of balances) {
        if (record.blockNumber <= blockNumber) {
            base.isZero() && log("balance record", record);
            return record.value;
        }
    }
    return base;
}

function getPastDelegations(
    records: DelegationRecord[],
    blockNumber: number
): DelegationRecord[] {
    return records.filter((record) => {
        return (
            record.blockStarted <= blockNumber &&
            (record.blockEnded == null || record.blockEnded > blockNumber)
        );
    });
}

function getTokenDelegation(
    records: DelegationRecord[],
    token: DelegationRecord["token"]
) {
    return records.filter((delegation) => delegation.token === token);
}

function getDelegationSnapshot(
    records: DelegationRecord[],
    token: DelegationRecord["token"],
    blockNumber: number
): BigNumber {
    const tokenRecords = getTokenDelegation(records, token);
    const snapshotRecords = getPastDelegations(tokenRecords, blockNumber);

    log("snapshot records", snapshotRecords);

    return snapshotRecords.reduce(
        (acc, record) => acc.add(record.amount),
        BigNumber.from(0)
    );
}

function calculateTokenVP(
    token: DelegationRecord["token"],
    balanceHistory: BalanceRecord[],
    delegatees: DelegationRecord[],
    delegations: DelegationRecord[],
    blockNumber: number
): BigNumber {
    const balanceSnapshot = getPastBalance(balanceHistory, blockNumber);
    const delegateesSnapshot = getDelegationSnapshot(
        delegatees,
        token,
        blockNumber
    );
    const delegatorsSnapshot = getDelegationSnapshot(
        delegations,
        token,
        blockNumber
    );

    log("past balance", balanceSnapshot.toHexString());
    log("delegateesSnapshot", delegateesSnapshot);
    log("delegatorsSnapshot", delegatorsSnapshot);

    return balanceSnapshot.add(delegateesSnapshot).sub(delegatorsSnapshot);
}

function checkAccount(account: Account, inflationMultipliers: BalanceRecord[]) {
    if (DEBUG && account.address !== DEBUG_ADDRESS) return [];

    return account.historicalVotingPowers.map((vpRecord) => {
        const { value, token, blockNumber } = vpRecord;

        if (DEBUG && DEBUG_BLOCK && blockNumber != DEBUG_BLOCK) return [];

        const pastMultiplier =
            token === Token.ECO
                ? getPastBalance(
                      inflationMultipliers,
                      blockNumber,
                      BigNumber.from("1000000000000000000")
                  )
                : BigNumber.from(1);

        const votingPower = calculateTokenVP(
            token,
            token === Token.ECO
                ? account.historicalECOBalances
                : account.historicalsECOxBalances,
            account.tokenDelegatees,
            account.tokenDelegators,
            blockNumber
        ).div(pastMultiplier);

        if (votingPower.eq(value)) {
            return [
                "\x1b[32m%s\x1b[0m",
                `- [block ${blockNumber}] [${token}] Voting Power correct! ${value.toHexString()}`,
            ];
        } else {
            return [
                "\x1b[31m%s\x1b[0m",
                `- [block ${blockNumber}] [${token}] Voting Power incorrect - Expected ${value.toHexString()} | got ${votingPower.toHexString()}`,
            ];
        }
    });
}

async function runTests() {
    const { accounts, multipliers } = await fetchData();
    accounts.forEach((account) => {
        const logs = checkAccount(account, multipliers).filter(
            (log) => !!(log && log.length)
        );
        const includesError = logs.some((log) => log[1].includes("Expected"));
        if (logs.length && includesError) {
            console.log(`Checking ${account.address} ...`);
            logs.forEach((log) => console.log(...log));
        }
    });
}

runTests();

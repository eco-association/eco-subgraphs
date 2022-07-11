// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class TrustedNodeAdded extends ethereum.Event {
  get params(): TrustedNodeAdded__Params {
    return new TrustedNodeAdded__Params(this);
  }
}

export class TrustedNodeAdded__Params {
  _event: TrustedNodeAdded;

  constructor(event: TrustedNodeAdded) {
    this._event = event;
  }

  get node(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class TrustedNodeRemoved extends ethereum.Event {
  get params(): TrustedNodeRemoved__Params {
    return new TrustedNodeRemoved__Params(this);
  }
}

export class TrustedNodeRemoved__Params {
  _event: TrustedNodeRemoved;

  constructor(event: TrustedNodeRemoved) {
    this._event = event;
  }

  get node(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class VotingRewardRedeemed extends ethereum.Event {
  get params(): VotingRewardRedeemed__Params {
    return new VotingRewardRedeemed__Params(this);
  }
}

export class VotingRewardRedeemed__Params {
  _event: VotingRewardRedeemed;

  constructor(event: VotingRewardRedeemed) {
    this._event = event;
  }

  get trustee(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class TrustedNodes extends ethereum.SmartContract {
  static bind(address: Address): TrustedNodes {
    return new TrustedNodes("TrustedNodes", address);
  }

  canImplementInterfaceForAddress(param0: Bytes, _addr: Address): Bytes {
    let result = super.call(
      "canImplementInterfaceForAddress",
      "canImplementInterfaceForAddress(bytes32,address):(bytes32)",
      [ethereum.Value.fromFixedBytes(param0), ethereum.Value.fromAddress(_addr)]
    );

    return result[0].toBytes();
  }

  try_canImplementInterfaceForAddress(
    param0: Bytes,
    _addr: Address
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "canImplementInterfaceForAddress",
      "canImplementInterfaceForAddress(bytes32,address):(bytes32)",
      [ethereum.Value.fromFixedBytes(param0), ethereum.Value.fromAddress(_addr)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  clone(): Address {
    let result = super.call("clone", "clone():(address)", []);

    return result[0].toAddress();
  }

  try_clone(): ethereum.CallResult<Address> {
    let result = super.tryCall("clone", "clone():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  cohort(): BigInt {
    let result = super.call("cohort", "cohort():(uint256)", []);

    return result[0].toBigInt();
  }

  try_cohort(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("cohort", "cohort():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  implementation(): Address {
    let result = super.call("implementation", "implementation():(address)", []);

    return result[0].toAddress();
  }

  try_implementation(): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "implementation",
      "implementation():(address)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  isTrusted(_node: Address): boolean {
    let result = super.call("isTrusted", "isTrusted(address):(bool)", [
      ethereum.Value.fromAddress(_node)
    ]);

    return result[0].toBoolean();
  }

  try_isTrusted(_node: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall("isTrusted", "isTrusted(address):(bool)", [
      ethereum.Value.fromAddress(_node)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  numTrustees(): BigInt {
    let result = super.call("numTrustees", "numTrustees():(uint256)", []);

    return result[0].toBigInt();
  }

  try_numTrustees(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("numTrustees", "numTrustees():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  policy(): Address {
    let result = super.call("policy", "policy():(address)", []);

    return result[0].toAddress();
  }

  try_policy(): ethereum.CallResult<Address> {
    let result = super.tryCall("policy", "policy():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  trustedNodes(param0: BigInt, param1: BigInt): Address {
    let result = super.call(
      "trustedNodes",
      "trustedNodes(uint256,uint256):(address)",
      [
        ethereum.Value.fromUnsignedBigInt(param0),
        ethereum.Value.fromUnsignedBigInt(param1)
      ]
    );

    return result[0].toAddress();
  }

  try_trustedNodes(
    param0: BigInt,
    param1: BigInt
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "trustedNodes",
      "trustedNodes(uint256,uint256):(address)",
      [
        ethereum.Value.fromUnsignedBigInt(param0),
        ethereum.Value.fromUnsignedBigInt(param1)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  trusteeNumber(param0: BigInt, param1: Address): BigInt {
    let result = super.call(
      "trusteeNumber",
      "trusteeNumber(uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(param0),
        ethereum.Value.fromAddress(param1)
      ]
    );

    return result[0].toBigInt();
  }

  try_trusteeNumber(
    param0: BigInt,
    param1: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "trusteeNumber",
      "trusteeNumber(uint256,address):(uint256)",
      [
        ethereum.Value.fromUnsignedBigInt(param0),
        ethereum.Value.fromAddress(param1)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  voteReward(): BigInt {
    let result = super.call("voteReward", "voteReward():(uint256)", []);

    return result[0].toBigInt();
  }

  try_voteReward(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("voteReward", "voteReward():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  votingRecord(param0: Address): BigInt {
    let result = super.call("votingRecord", "votingRecord(address):(uint256)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBigInt();
  }

  try_votingRecord(param0: Address): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "votingRecord",
      "votingRecord(address):(uint256)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _policy(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _initial(): Array<Address> {
    return this._call.inputValues[1].value.toAddressArray();
  }

  get _voteReward(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CloneCall extends ethereum.Call {
  get inputs(): CloneCall__Inputs {
    return new CloneCall__Inputs(this);
  }

  get outputs(): CloneCall__Outputs {
    return new CloneCall__Outputs(this);
  }
}

export class CloneCall__Inputs {
  _call: CloneCall;

  constructor(call: CloneCall) {
    this._call = call;
  }
}

export class CloneCall__Outputs {
  _call: CloneCall;

  constructor(call: CloneCall) {
    this._call = call;
  }

  get value0(): Address {
    return this._call.outputValues[0].value.toAddress();
  }
}

export class DistrustCall extends ethereum.Call {
  get inputs(): DistrustCall__Inputs {
    return new DistrustCall__Inputs(this);
  }

  get outputs(): DistrustCall__Outputs {
    return new DistrustCall__Outputs(this);
  }
}

export class DistrustCall__Inputs {
  _call: DistrustCall;

  constructor(call: DistrustCall) {
    this._call = call;
  }

  get _node(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class DistrustCall__Outputs {
  _call: DistrustCall;

  constructor(call: DistrustCall) {
    this._call = call;
  }
}

export class InitializeCall extends ethereum.Call {
  get inputs(): InitializeCall__Inputs {
    return new InitializeCall__Inputs(this);
  }

  get outputs(): InitializeCall__Outputs {
    return new InitializeCall__Outputs(this);
  }
}

export class InitializeCall__Inputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }

  get _self(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class InitializeCall__Outputs {
  _call: InitializeCall;

  constructor(call: InitializeCall) {
    this._call = call;
  }
}

export class NewCohortCall extends ethereum.Call {
  get inputs(): NewCohortCall__Inputs {
    return new NewCohortCall__Inputs(this);
  }

  get outputs(): NewCohortCall__Outputs {
    return new NewCohortCall__Outputs(this);
  }
}

export class NewCohortCall__Inputs {
  _call: NewCohortCall;

  constructor(call: NewCohortCall) {
    this._call = call;
  }

  get _newCohort(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }
}

export class NewCohortCall__Outputs {
  _call: NewCohortCall;

  constructor(call: NewCohortCall) {
    this._call = call;
  }
}

export class PolicyCommandCall extends ethereum.Call {
  get inputs(): PolicyCommandCall__Inputs {
    return new PolicyCommandCall__Inputs(this);
  }

  get outputs(): PolicyCommandCall__Outputs {
    return new PolicyCommandCall__Outputs(this);
  }
}

export class PolicyCommandCall__Inputs {
  _call: PolicyCommandCall;

  constructor(call: PolicyCommandCall) {
    this._call = call;
  }

  get _delegate(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _data(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }
}

export class PolicyCommandCall__Outputs {
  _call: PolicyCommandCall;

  constructor(call: PolicyCommandCall) {
    this._call = call;
  }
}

export class RecordVoteCall extends ethereum.Call {
  get inputs(): RecordVoteCall__Inputs {
    return new RecordVoteCall__Inputs(this);
  }

  get outputs(): RecordVoteCall__Outputs {
    return new RecordVoteCall__Outputs(this);
  }
}

export class RecordVoteCall__Inputs {
  _call: RecordVoteCall;

  constructor(call: RecordVoteCall) {
    this._call = call;
  }

  get _who(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RecordVoteCall__Outputs {
  _call: RecordVoteCall;

  constructor(call: RecordVoteCall) {
    this._call = call;
  }
}

export class RedeemVoteRewardsCall extends ethereum.Call {
  get inputs(): RedeemVoteRewardsCall__Inputs {
    return new RedeemVoteRewardsCall__Inputs(this);
  }

  get outputs(): RedeemVoteRewardsCall__Outputs {
    return new RedeemVoteRewardsCall__Outputs(this);
  }
}

export class RedeemVoteRewardsCall__Inputs {
  _call: RedeemVoteRewardsCall;

  constructor(call: RedeemVoteRewardsCall) {
    this._call = call;
  }
}

export class RedeemVoteRewardsCall__Outputs {
  _call: RedeemVoteRewardsCall;

  constructor(call: RedeemVoteRewardsCall) {
    this._call = call;
  }
}

export class SetExpectedInterfaceSetCall extends ethereum.Call {
  get inputs(): SetExpectedInterfaceSetCall__Inputs {
    return new SetExpectedInterfaceSetCall__Inputs(this);
  }

  get outputs(): SetExpectedInterfaceSetCall__Outputs {
    return new SetExpectedInterfaceSetCall__Outputs(this);
  }
}

export class SetExpectedInterfaceSetCall__Inputs {
  _call: SetExpectedInterfaceSetCall;

  constructor(call: SetExpectedInterfaceSetCall) {
    this._call = call;
  }

  get _addr(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class SetExpectedInterfaceSetCall__Outputs {
  _call: SetExpectedInterfaceSetCall;

  constructor(call: SetExpectedInterfaceSetCall) {
    this._call = call;
  }
}

export class TrustCall extends ethereum.Call {
  get inputs(): TrustCall__Inputs {
    return new TrustCall__Inputs(this);
  }

  get outputs(): TrustCall__Outputs {
    return new TrustCall__Outputs(this);
  }
}

export class TrustCall__Inputs {
  _call: TrustCall;

  constructor(call: TrustCall) {
    this._call = call;
  }

  get _node(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TrustCall__Outputs {
  _call: TrustCall;

  constructor(call: TrustCall) {
    this._call = call;
  }
}

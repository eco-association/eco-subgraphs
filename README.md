- [Development](#development)
- [Manifest](#manifest)
- [Entities](#entities)
- [Mappings](#mappings)
- [Production](#production)

## Development

Running the subgraph in development is a task on it's own, in order to run the subgraph in conjunction with the [local ganache chain](https://github.com/eco/currency), you must first start the blockchain, and fetch the following addresses:

- TrustedNodes
- CurrencyTimer
- TimedPolicies
- ECO
- ECOx
- ECOxStaking

You'll also need to have docker running, we recommend [4.8.2](https://docs.docker.com/desktop/release-notes/#docker-desktop-482).

Once you have the addresses, paste them into [networks.json](./networks.json) under 'localhost', then run `yarn network` to sync the `subgraph.yaml` file.

Start up the graph node by running the command `yarn graph-node` (if you haven't added the submodule yet, run `git submodule update --init`)

Once you start up the graph-node, run  `yarn codegen`, then run `yarn create-local` once to create your subgraph on the local node. Then to deploy (or redeploy after making changes), run `yarn deploy-local`.

Make sure to run `yarn codegen` to generate AssemblyScript code any time you make changes to entities in `schema.graphql` or add templates or data sources to `subgraph.yaml`, before working on mappings.

Once you have successfully deployed the subgraph locally you can test queries [here](http://localhost:8000/subgraphs/name/paged1/Policy/graphql)


## Manifest

The manifest is the [subgraph.yaml](./subgraph.yaml) file in the root directory.

This file outlines the contracts that take part in the subgraphs, referred to as **data sources** for static contracts, or **data source templates** for dynamic contracts. Each data source has **eventHandlers**, which define what mapping functions will be called when the on-chain event is emitted. see [mappings](#mappings).

[See more](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#the-subgraph-manifest)

## Entities

The entities are defined in the [schema.graphql](./schema.graphql) file. Entities are graphql objects that are created by your mapping functions, and similair to sql tables, they can be used to make queries using the graphql protocol.

[See more](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#defining-entities)

## Mappings

Mappings are the AssemblyScript functions that fire when the graph node detects an event pre-defined in the manifest for a data source or template. You can use them to create/update/delete entities or add new contract templates.

[See more](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#writing-mappings)

[AssemblyScript API](https://thegraph.com/docs/en/developer/assemblyscript-api/)


## Production

In order to deploy the subgraph to the hosted service, create a new object in `networks.json` with the key `"mainnet"`, use the exact same structure as the goerli and localhost objects, where each contract has `address` and `startBlock` attributes.

As LockupVaultFactory or ECOWrapped may not be deployed with the rest of the contracts, you can use `0x0000000000000000000000000000000000000000` as the address, and copy the startBlock from any other of your production deployed contracts. Do not use a a startBlock of 0 as the subgraph will try to listen for events from the very beginning of the network.

Once the `networks.json` file has the mainnet configuration, run `yarn network mainnet` and `graph deploy --node https://api.thegraph.com/deploy/ <your account>/<your subgraph project>` to deploy the subgraph to the hosted service.

You will need to [install the Graph CLI](https://thegraph.com/docs/en/cookbook/quick-start/#1-install-the-graph-cli)
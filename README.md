- [Development](#development)
- [Manifest](#manifest)
- [Entities](#entities)
- [Mappings](#mappings)

## Development

Running the subgraph in development is a task on it's own, in order to run the subgraph in conjunction with the [local ganache chain](https://github.com/eco/currency), you must first start the blockchain, and fetch the TimedPolicies address.

Once you have the address, paste it in [networks.json](./networks.json) under 'localhost', then run `yarn network` to sync the `subgraph.yaml` file.

Once you start up the graph-node, run `yarn create-local` once to create your subgraph on the local node. Then to deploy (or redeploy after making changes), run `yarn deploy-local`.

If you make changes to entities in `schema.graphql` or add templates or data sources to `subgraph.yaml`, run `yarn codegen` to generate AssemblyScript code before working on mappings.

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

import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

// Initialize Apollo Client with optimized caching
export const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/54899/aigentx/version/latest',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          nfts: {
            keyArgs: ['where', 'orderBy', 'orderDirection'],
            merge(existing = [], incoming, { args = {} }) {
              const merged = existing ? existing.slice(0) : [];
              const { skip = 0 } = args;
              for (let i = 0; i < incoming.length; ++i) {
                merged[skip + i] = incoming[i];
              }
              return merged;
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
    }
  }
});

// Optimized fragment for common NFT fields
const NFT_FIELDS = gql`
  fragment NFTFields on NFT {
    id
    tokenId
    tokenURI
    price
    isAIGenerated
    createdAt
  }
`;

// Optimized queries with field fragments and pagination
export const GET_ALL_NFTS = gql`
  ${NFT_FIELDS}
  query GetAllNFTs($first: Int = 20, $skip: Int = 0) {
    nfts(
      first: $first, 
      skip: $skip, 
      orderBy: createdAt, 
      orderDirection: desc
    ) {
      ...NFTFields
      owner {
        id
      }
    }
  }
`;

export const GET_USER_NFTS = gql`
  ${NFT_FIELDS}
  query GetUserNFTs($owner: String!, $first: Int = 20) {
    nfts(
      where: { owner: $owner },
      first: $first,
      orderBy: createdAt,
      orderDirection: desc
    ) {
      ...NFTFields
    }
  }
`;

export const GET_MARKETPLACE_NFTS = gql`
  ${NFT_FIELDS}
  query GetMarketplaceNFTs($first: Int = 20, $skip: Int = 0) {
    nfts(
      where: { price_gt: "0" },
      first: $first,
      skip: $skip,
      orderBy: createdAt,
      orderDirection: desc
    ) {
      ...NFTFields
      owner {
        id
      }
    }
  }
`; 
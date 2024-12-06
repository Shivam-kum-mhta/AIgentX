import { useQuery } from '@apollo/client';
import { useMemo, useState, useCallback } from 'react';
import { GET_ALL_NFTS, GET_USER_NFTS, GET_MARKETPLACE_NFTS } from '../services/graphqlService';

const ITEMS_PER_PAGE = 20;

export const useNFTs = () => {
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [pageNumber, setPageNumber] = useState(0);

    // Query for all NFTs with pagination
    const { data: allNFTs, loading: loadingAll, error: allError, fetchMore: fetchMoreAll } = useQuery(GET_ALL_NFTS, {
        variables: { first: ITEMS_PER_PAGE, skip: 0 },
        onError: (error) => setError(error),
        notifyOnNetworkStatusChange: true
    });
    
    // Query for marketplace NFTs with pagination
    const { data: marketplaceNFTs, loading: loadingMarketplace, error: marketError, fetchMore: fetchMoreMarketplace } = useQuery(GET_MARKETPLACE_NFTS, {
        variables: { first: ITEMS_PER_PAGE, skip: 0 },
        onError: (error) => setError(error),
        notifyOnNetworkStatusChange: true
    });

    // Optimized function to load more NFTs
    const loadMore = useCallback(async (type = 'all') => {
        const skip = (pageNumber + 1) * ITEMS_PER_PAGE;
        try {
            const fetchMoreFn = type === 'all' ? fetchMoreAll : fetchMoreMarketplace;
            const result = await fetchMoreFn({
                variables: {
                    skip,
                    first: ITEMS_PER_PAGE
                },
                updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) return prev;
                    if (fetchMoreResult.nfts.length < ITEMS_PER_PAGE) {
                        setHasMore(false);
                    }
                    return {
                        nfts: [...prev.nfts, ...fetchMoreResult.nfts]
                    };
                }
            });
            setPageNumber(prev => prev + 1);
            return result;
        } catch (err) {
            setError(err);
            setHasMore(false);
        }
    }, [pageNumber, fetchMoreAll, fetchMoreMarketplace]);

    // Optimized getUserNFTs with caching
    const getUserNFTs = (address) => {
        const { data, loading: loadingUser, error: userError } = useQuery(GET_USER_NFTS, {
            variables: { 
                owner: address?.toLowerCase(),
                first: ITEMS_PER_PAGE
            },
            skip: !address,
            fetchPolicy: 'cache-first',
            onError: (error) => setError(error)
        });

        return useMemo(() => ({
            userNFTs: data?.nfts || [],
            loading: loadingUser,
            error: userError
        }), [data, loadingUser, userError]);
    };

    // Reset pagination
    const resetPagination = useCallback(() => {
        setPageNumber(0);
        setHasMore(true);
    }, []);

    return useMemo(() => ({
        allNFTs: allNFTs?.nfts || [],
        marketplaceNFTs: marketplaceNFTs?.nfts || [],
        getUserNFTs,
        loading: loadingAll || loadingMarketplace,
        error: error || allError || marketError,
        hasMore,
        loadMore,
        resetPagination
    }), [
        allNFTs,
        marketplaceNFTs,
        loadingAll,
        loadingMarketplace,
        error,
        allError,
        marketError,
        hasMore,
        loadMore,
        resetPagination
    ]);
}; 
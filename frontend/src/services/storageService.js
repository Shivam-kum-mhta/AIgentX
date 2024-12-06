import axios from 'axios';

// Walrus testnet endpoints
const WALRUS_PUBLISHER = 'https://walrus-testnet-publisher.stakin-nodes.com';
const WALRUS_AGGREGATOR = 'https://walrus-testnet-aggregator.stakin-nodes.com';

// Upload file to Walrus
export const uploadFile = async (file) => {
    try {
        // Convert base64 to blob if needed
        let fileToUpload = file;
        if (typeof file === 'string' && file.startsWith('data:')) {
            const response = await fetch(file);
            fileToUpload = await response.blob();
        }

        const response = await axios.put(
            `${WALRUS_PUBLISHER}/v1/store`,
            fileToUpload,
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 30000, // 30 second timeout
            }
        );

        if (!response.data?.newlyCreated?.blobObject?.blobId && !response.data?.alreadyCertified?.blobId) {
            throw new Error('Invalid response from Walrus');
        }

        // Return the blobId from either new or certified response
        return response.data.newlyCreated?.blobObject?.blobId || response.data.alreadyCertified?.blobId;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        }
        if (error.code === 'ECONNABORTED') {
            throw new Error('Upload timed out. Please try again with a smaller file or check your connection.');
        }
        console.error('File upload error:', error.response?.data || error.message);
        throw new Error('Failed to upload file: ' + (error.response?.data?.message || error.message));
    }
};

// Upload JSON to Walrus
export const uploadJSON = async (json) => {
    try {
        const jsonString = JSON.stringify(json);
        const response = await axios.put(
            `${WALRUS_PUBLISHER}/v1/store`,
            jsonString,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 30000,
            }
        );

        if (!response.data?.newlyCreated?.blobObject?.blobId && !response.data?.alreadyCertified?.blobId) {
            throw new Error('Invalid response from Walrus');
        }

        return response.data.newlyCreated?.blobObject?.blobId || response.data.alreadyCertified?.blobId;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        }
        if (error.code === 'ECONNABORTED') {
            throw new Error('Upload timed out. Please try again or check your connection.');
        }
        console.error('JSON upload error:', error.response?.data || error.message);
        throw new Error('Failed to upload JSON: ' + (error.response?.data?.message || error.message));
    }
};

// Get IPFS URL using Walrus gateway
export const getIPFSUrl = (ipfsUrl) => {
    // Handle invalid or empty input
    if (!ipfsUrl || typeof ipfsUrl !== 'string') {
        console.warn('Invalid IPFS URL received:', ipfsUrl);
        return 'https://via.placeholder.com/400?text=Invalid+Image+URL';
    }

    try {
        // Handle if it's already a full URL
        if (ipfsUrl.startsWith('http')) {
            return ipfsUrl;
        }

        // Extract the blob ID/CID
        let blobId = ipfsUrl;
        if (ipfsUrl.startsWith('ipfs://')) {
            blobId = ipfsUrl.replace('ipfs://', '');
        }

        // Validate blob ID format
        if (!blobId || typeof blobId !== 'string' || blobId.length < 32) {
            console.warn('Invalid blob ID format:', blobId);
            return 'https://via.placeholder.com/400?text=Invalid+Image+URL';
        }

        // Return the aggregator URL
        return `${WALRUS_AGGREGATOR}/v1/${blobId}`;
    } catch (error) {
        console.error('Error processing URL:', error);
        return 'https://via.placeholder.com/400?text=Error+Loading+Image';
    }
};
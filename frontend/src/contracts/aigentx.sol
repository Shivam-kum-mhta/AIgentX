// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.0001 ether;
    bool public isMintingPaused = false;

    // Storage for token metadata
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256) public tokenPrices;
    mapping(uint256 => NFTMetadata) public tokenMetadata;

    // Struct to store additional metadata about the NFT
    struct NFTMetadata {
        string ipfsHash;           // IPFS hash of the image
        string aiPrompt;           // The prompt used to generate the image
        uint256 generationDate;    // Timestamp when the image was generated
        bool isAIGenerated;        // Whether it's AI generated or uploaded
        string aiModel;            // The AI model used (if AI-generated)
    }

    // Events
    event TokenMinted(
        address indexed to, 
        uint256 indexed tokenId, 
        string ipfsHash, 
        bool isAIGenerated
    );
    event TokenPriceSet(uint256 indexed tokenId, uint256 price);
    event TokenSold(
        address indexed from, 
        address indexed to, 
        uint256 indexed tokenId, 
        uint256 price
    );

    constructor() ERC721("AI Art Marketplace", "AIART") {}

    // Function to mint AI-generated NFT
    function mintAIGeneratedNFT(
        string memory ipfsHash,
        string memory prompt,
        string memory aiModel
    ) public payable {
        require(!isMintingPaused, "Minting is paused");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, ipfsHash);

        // Store additional metadata
        tokenMetadata[newTokenId] = NFTMetadata({
            ipfsHash: ipfsHash,
            aiPrompt: prompt,
            generationDate: block.timestamp,
            isAIGenerated: true,
            aiModel: aiModel
        });

        emit TokenMinted(msg.sender, newTokenId, ipfsHash, true);
    }

    // Function to mint uploaded NFT
    function mintUploadedNFT(string memory ipfsHash) public payable {
        require(!isMintingPaused, "Minting is paused");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, ipfsHash);

        // Store additional metadata
        tokenMetadata[newTokenId] = NFTMetadata({
            ipfsHash: ipfsHash,
            aiPrompt: "",
            generationDate: block.timestamp,
            isAIGenerated: false,
            aiModel: ""
        });

        emit TokenMinted(msg.sender, newTokenId, ipfsHash, false);
    }

    function setTokenPrice(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the token owner");
        tokenPrices[tokenId] = price;
        emit TokenPriceSet(tokenId, price);
    }

    function buyToken(uint256 tokenId) public payable {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(tokenPrices[tokenId] > 0, "Token not for sale");
        require(msg.value >= tokenPrices[tokenId], "Insufficient payment");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);

        uint256 price = tokenPrices[tokenId];
        tokenPrices[tokenId] = 0;

        // Use call for better security
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Transfer to seller failed");

        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund to buyer failed");
        }

        emit TokenSold(seller, msg.sender, tokenId, price);
    }

    function getTokenMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenMetadata[tokenId];
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    function toggleMinting() public onlyOwner {
        isMintingPaused = !isMintingPaused;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
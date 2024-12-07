// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AIgentX is ERC721Enumerable, Ownable {
    // Pricing constants
    uint256 public mintPrice = 0.0001 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    bool public isMintingPaused = false;

    // Struct for Agent Metadata
    struct AgentMetadata {
        string uuid;               // Unique identifier for the agent
        string name;               // Agent name
        string description;        // Agent description
        string tokenURI;          // Walrus blob ID for metadata
        uint256 marketPrice;       // Price to buy the agent
        uint256 rentPrice;         // Price to rent the agent (per day)
        uint256 rating;            // Cumulative rating
        uint256 ratingCount;       // Number of ratings
        bool isForSale;            // Whether agent is listed for sale
        bool isForRent;            // Whether agent is available for rent
        mapping(address => bool) hasRated; // Track who has rated
        mapping(address => RentalInfo) rentals; // Track rentals
    }

    // Struct for Rental Information
    struct RentalInfo {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    // Storage
    mapping(string => uint256) public uuidToTokenId;
    mapping(uint256 => AgentMetadata) public agents;
    
    // Events
    event AgentMinted(address indexed owner, uint256 indexed tokenId, string uuid, string name);
    event AgentListed(uint256 indexed tokenId, uint256 marketPrice, uint256 rentPrice);
    event AgentSold(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);
    event AgentRented(address indexed renter, uint256 indexed tokenId, uint256 duration);
    event AgentRated(uint256 indexed tokenId, address indexed rater, uint256 rating);
    event RentalEnded(uint256 indexed tokenId, address indexed renter);
    event PriceUpdated(uint256 indexed tokenId, uint256 marketPrice, uint256 rentPrice);

    constructor() ERC721("AIgentX", "AIGX") Ownable(msg.sender) {
        // Initialize contract
    }

    // Override tokenURI function to return Walrus blob ID
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return agents[tokenId].tokenURI;
    }
    

    // Mint new AI Agent
    function mintAgent(
        string memory uuid,
        string memory name,
        string memory description,
        string memory _tokenURI
    ) public payable {
        require(!isMintingPaused, "Minting is paused");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(uuidToTokenId[uuid] == 0, "UUID already exists");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(_tokenURI).length > 0, "TokenURI cannot be empty");

        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);

        AgentMetadata storage newAgent = agents[tokenId];
        newAgent.uuid = uuid;
        newAgent.name = name;
        newAgent.description = description;
        newAgent.tokenURI = _tokenURI;
        
        uuidToTokenId[uuid] = tokenId;

        emit AgentMinted(msg.sender, tokenId, uuid, name);
    }

    // List agent for sale and/or rent
    function listAgent(
        uint256 tokenId,
        uint256 marketPrice,
        uint256 rentPrice,
        bool forSale,
        bool forRent
    ) public {
        require(ownerOf(tokenId) == msg.sender, "Not the agent owner");
        require(marketPrice > 0 || rentPrice > 0, "Price must be greater than 0");
        
        AgentMetadata storage agent = agents[tokenId];
        agent.marketPrice = marketPrice;
        agent.rentPrice = rentPrice;
        agent.isForSale = forSale;
        agent.isForRent = forRent;

        emit AgentListed(tokenId, marketPrice, rentPrice);
    }

    // Buy agent
    function buyAgent(uint256 tokenId) public payable {
        require(_exists(tokenId), "Agent does not exist");
        require(agents[tokenId].isForSale, "Agent not for sale");
        require(msg.value >= agents[tokenId].marketPrice, "Insufficient payment");
        require(ownerOf(tokenId) != msg.sender, "Cannot buy your own agent");

        address seller = ownerOf(tokenId);
        uint256 price = agents[tokenId].marketPrice;

        _transfer(seller, msg.sender, tokenId);
        agents[tokenId].isForSale = false;
        agents[tokenId].isForRent = false;

        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "Transfer to seller failed");

        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(refundSuccess, "Refund failed");
        }

        emit AgentSold(seller, msg.sender, tokenId, price);
    }

    // Rent agent
    function rentAgent(uint256 tokenId, uint256 durationInDays) public payable {
        require(_exists(tokenId), "Agent does not exist");
        require(agents[tokenId].isForRent, "Agent not available for rent");
        require(durationInDays > 0, "Duration must be greater than 0");
        require(ownerOf(tokenId) != msg.sender, "Cannot rent your own agent");

        uint256 totalRentPrice = agents[tokenId].rentPrice * durationInDays;
        require(msg.value >= totalRentPrice, "Insufficient payment");

        AgentMetadata storage agent = agents[tokenId];
        RentalInfo storage rental = agent.rentals[msg.sender];
        
        require(!rental.isActive, "Already renting this agent");

        rental.startTime = block.timestamp;
        rental.endTime = block.timestamp + (durationInDays * 1 days);
        rental.isActive = true;

        address owner = ownerOf(tokenId);
        (bool success, ) = payable(owner).call{value: msg.value}("");
        require(success, "Transfer to owner failed");

        emit AgentRented(msg.sender, tokenId, durationInDays);
    }

    // End rental
    function endRental(uint256 tokenId) public {
        require(_exists(tokenId), "Agent does not exist");
        AgentMetadata storage agent = agents[tokenId];
        RentalInfo storage rental = agent.rentals[msg.sender];
        
        require(rental.isActive, "No active rental");
        require(block.timestamp >= rental.endTime, "Rental period not over");
        
        rental.isActive = false;
        
        emit RentalEnded(tokenId, msg.sender);
    }

    // Rate agent
    function rateAgent(uint256 tokenId, uint256 rating) public {
        require(_exists(tokenId), "Agent does not exist");
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        
        AgentMetadata storage agent = agents[tokenId];
        require(!agent.hasRated[msg.sender], "Already rated");
        require(
            agent.rentals[msg.sender].isActive || 
            agent.rentals[msg.sender].endTime > 0, 
            "Must have rented to rate"
        );

        agent.rating += rating;
        agent.ratingCount++;
        agent.hasRated[msg.sender] = true;

        emit AgentRated(tokenId, msg.sender, rating);
    }

    // View functions
    function getAgentRating(uint256 tokenId) public view returns (uint256, uint256) {
        require(_exists(tokenId), "Agent does not exist");
        return (agents[tokenId].rating, agents[tokenId].ratingCount);
    }

    function getAgentDetails(uint256 tokenId) public view returns (
        string memory uuid,
        string memory name,
        string memory description,
        uint256 marketPrice,
        uint256 rentPrice,
        bool isForSale,
        bool isForRent,
        uint256 rating,
        uint256 ratingCount
    ) {
        require(_exists(tokenId), "Agent does not exist");
        AgentMetadata storage agent = agents[tokenId];
        return (
            agent.uuid,
            agent.name,
            agent.description,
            agent.marketPrice,
            agent.rentPrice,
            agent.isForSale,
            agent.isForRent,
            agent.rating,
            agent.ratingCount
        );
    }

    function isAgentRented(uint256 tokenId, address renter) public view returns (bool) {
        require(_exists(tokenId), "Agent does not exist");
        return agents[tokenId].rentals[renter].isActive;
    }

    function getRentalDetails(uint256 tokenId, address renter) public view returns (
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        require(_exists(tokenId), "Agent does not exist");
        RentalInfo storage rental = agents[tokenId].rentals[renter];
        return (rental.startTime, rental.endTime, rental.isActive);
    }

    // Internal helper function
    function _exists(uint256 tokenId) internal view returns (bool) {
        return ownerOf(tokenId) != address(0);
    }

    // Admin functions
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
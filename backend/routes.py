from fastapi import APIRouter, HTTPException, WebSocket
from schemas import (agentCreation, walletAddress, ChatAuthorization, 
                    agentInteract, agentInteractResponse)
from Agent import CreateAgent, load_agent
from chat_websockets import ChatWebSocket
from typing import Dict

# Create a router instead of an app
router = APIRouter()

# Store chat authorizations in memory
chat_authorizations: Dict[str, ChatAuthorization] = {}

# Initialize WebSocket handler
chat_websocket = ChatWebSocket(chat_authorizations)

@router.post("/create-agent/{user_id}", response_model=walletAddress)
async def create_agent(user_id: str, request: agentCreation) -> walletAddress:
    try:
        response = CreateAgent(prompt=request.prompt, NFT_id=request.nftHash)
        
        # Add debug logging
        print(f"Creating agent for user: {user_id}")
        print(f"NFT hash: {request.nftHash}")
        
        chat_auth = ChatAuthorization(
            creator=user_id.lower(),  # Store lowercase
            members=[]
        )
        
        chat_authorizations[request.nftHash] = chat_auth
        print(f"Updated chat authorizations: {chat_authorizations}")
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agent-interact/{nft_hash}/{user_id}", response_model=agentInteractResponse)
async def interact_with_agent(
    nft_hash: str, 
    user_id: str, 
    request: agentInteract
) -> agentInteractResponse:
    if nft_hash not in chat_authorizations:
        raise HTTPException(
            status_code=404,
            detail="NFT hash not found in authorization map"
        )
    
    auth = chat_authorizations[nft_hash]
    
    if user_id != auth.creator and user_id not in auth.members:
        raise HTTPException(
            status_code=403,
            detail="User not authorized to interact with this agent"
        )
    
    try:
        response = load_agent(NFT_id=nft_hash, prompt=request.prompt)
        
        return agentInteractResponse(
            response=response,
            isMetaMask=False,
            Responses=1
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{nft_hash}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, nft_hash: str, user_id: str):
    # Add debug logging
    print(f"WebSocket connection attempt:")
    print(f"NFT hash: {nft_hash}")
    print(f"User ID: {user_id}")
    print(f"Current authorizations: {chat_authorizations}")
    
    await chat_websocket.handle_websocket_connection(websocket, nft_hash, user_id)

@router.post("/add-chat-member/{nft_hash}/{new_member}")
async def add_chat_member(nft_hash: str, new_member: str, creator_id: str):
    if nft_hash not in chat_authorizations:
        raise HTTPException(
            status_code=404,
            detail="NFT hash not found"
        )
    
    auth = chat_authorizations[nft_hash]
    if creator_id != auth.creator:
        raise HTTPException(
            status_code=403,
            detail="Only the creator can add members"
        )
    
    if new_member not in auth.members:
        auth.members.append(new_member)
        return {"status": "success", "message": f"Added {new_member} to chat"}
    
    return {"status": "info", "message": "Member already exists in chat"}

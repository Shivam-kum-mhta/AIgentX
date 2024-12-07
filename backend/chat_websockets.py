from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from schemas import agentInteract, agentInteractResponse
from Agent import load_agent

class ConnectionManager:
    def __init__(self):
        # Format: {f"{nft_hash}_{user_id}": WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, nft_hash: str, user_id: str):
        """Establish and store a new WebSocket connection"""
        await websocket.accept()
        connection_id = f"{nft_hash}_{user_id}"
        self.active_connections[connection_id] = websocket
        
    async def disconnect(self, nft_hash: str, user_id: str):
        """Remove a WebSocket connection"""
        connection_id = f"{nft_hash}_{user_id}"
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
    
    async def send_personal_message(self, message: str, nft_hash: str, user_id: str):
        """Send a message to a specific user in a specific chat"""
        connection_id = f"{nft_hash}_{user_id}"
        if connection_id in self.active_connections:
            await self.active_connections[connection_id].send_text(message)
    
    async def broadcast_to_chat(self, message: str, nft_hash: str):
        """Broadcast a message to all users in a specific NFT chat"""
        for conn_id, websocket in self.active_connections.items():
            if conn_id.startswith(f"{nft_hash}_"):
                await websocket.send_text(message)

class ChatWebSocket:
    def __init__(self, chat_authorizations: Dict[str, any]):
        self.manager = ConnectionManager()
        self.chat_authorizations = chat_authorizations

    async def handle_websocket_connection(self, 
                                        websocket: WebSocket, 
                                        nft_hash: str, 
                                        user_id: str):
        """Handle the main WebSocket connection and communication"""
        
        # Add debug logging
        print(f"Attempting connection for NFT hash: {nft_hash}")
        print(f"User ID: {user_id}")
        print(f"Available authorizations: {self.chat_authorizations}")
        
        # Check if NFT exists in authorization map
        if nft_hash not in self.chat_authorizations:
            print(f"NFT hash {nft_hash} not found in authorizations")
            await websocket.close(code=4004, reason="NFT hash not found")
            return
            
        # Check user authorization
        auth = self.chat_authorizations[nft_hash]
        if user_id.lower() != auth.creator.lower() and user_id.lower() not in [member.lower() for member in auth.members]:
            print(f"User {user_id} not authorized for NFT {nft_hash}")
            await websocket.close(code=4003, reason="User not authorized")
            return

        await self.manager.connect(websocket, nft_hash, user_id)
        
        try:
            while True:
                # Receive and process messages
                data = await websocket.receive_text()
                
                try:
                    # Parse incoming message
                    message_data = json.loads(data)
                    
                    # Create agent interaction request
                    interaction = agentInteract(
                        prompt=message_data.get("prompt"),
                        nftHash=nft_hash,
                        userId=user_id
                    )
                    
                    # Get response from agent
                    response = load_agent(NFT_id=nft_hash, prompt=interaction.prompt)
                    
                    # Send response back to client
                    await self.manager.send_personal_message(
                        json.dumps(response.dict()),
                        nft_hash,
                        user_id
                    )
                    
                except json.JSONDecodeError:
                    await self.manager.send_personal_message(
                        json.dumps({"error": "Invalid message format"}),
                        nft_hash,
                        user_id
                    )
                    
        except WebSocketDisconnect:
            await self.manager.disconnect(nft_hash, user_id)

    async def send_system_message(self, message: str, nft_hash: str, user_id: str):
        """Send a system message to a specific user"""
        await self.manager.send_personal_message(
            json.dumps({"system_message": message}),
            nft_hash,
            user_id
        )

    async def broadcast_chat_message(self, message: str, nft_hash: str):
        """Broadcast a message to all users in a specific NFT chat"""
        await self.manager.broadcast_to_chat(
            json.dumps({"broadcast_message": message}),
            nft_hash
        )

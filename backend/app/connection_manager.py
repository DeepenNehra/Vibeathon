from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    """Manages WebSocket connections for consultations"""
    
    def __init__(self):
        # Structure: {consultation_id: {user_type: WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, consultation_id: str, user_type: str):
        """Accept and track WebSocket connection"""
        await websocket.accept()
        
        if consultation_id not in self.active_connections:
            self.active_connections[consultation_id] = {}
        
        self.active_connections[consultation_id][user_type] = websocket
    
    def disconnect(self, consultation_id: str, user_type: str):
        """Remove WebSocket connection"""
        if consultation_id in self.active_connections:
            if user_type in self.active_connections[consultation_id]:
                del self.active_connections[consultation_id][user_type]
            
            # Clean up empty consultation entries
            if not self.active_connections[consultation_id]:
                del self.active_connections[consultation_id]
    
    async def broadcast_to_other(
        self, 
        consultation_id: str, 
        sender_type: str, 
        message: dict
    ):
        """Send message to the other participant in the consultation"""
        if consultation_id not in self.active_connections:
            return
        
        # Determine recipient type
        recipient_type = "patient" if sender_type == "doctor" else "doctor"
        
        # Send to recipient if connected
        if recipient_type in self.active_connections[consultation_id]:
            recipient_ws = self.active_connections[consultation_id][recipient_type]
            await recipient_ws.send_json(message)

# Singleton instance
manager = ConnectionManager()

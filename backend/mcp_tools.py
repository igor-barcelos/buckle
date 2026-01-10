from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field
from typing import Any, Optional, List
from schemas import Model, Node, Member, BoundaryCondition, ClientResponse, LinearLoad
import asyncio
import time
import uuid
import json
import random
import os

# Load tool descriptions
TOOLS_DESCRIPTIONS_PATH = os.path.join(os.path.dirname(__file__), "utils", "tools_descriptions.json")
with open(TOOLS_DESCRIPTIONS_PATH, "r", encoding="utf-8") as f:
    TOOL_DESCRIPTIONS = json.load(f)

mcp_server = FastMCP(name="buckle-mcp-server", stateless_http=True)

# WebSocket connection and message storage
client_connection: Optional[Any] = None
messages: list = []

@mcp_server.tool(description=TOOL_DESCRIPTIONS["get_scene_info"])
async def get_scene_info() -> Model:
    """Contact WebSocket client and retrieve scene state with Model schema"""
    global client_connection, messages
    
    if not client_connection:
        raise Exception("No WebSocket client connected")
    
    try:
        # Generate a unique ID for the message
        msg_id = str(uuid.uuid4())
        payload = { "id": msg_id, "message": "get_scene_info", "type": "get_scene_info"}
        
        await client_connection.send_text(json.dumps(payload))
        timeout = 10.0  # 10 seconds timeout
        start_time = time.time()
        answer = None
        
        while not answer and (time.time() - start_time) < timeout:
            # Check if we have a response
            answer = next((msg for msg in messages if msg.get("id") == msg_id), None)

            if not answer:
                # Wait a bit before checking again (non-blocking)
                await asyncio.sleep(0.1)
        
        data = answer.get("data", {})

        return Model(**data)
        
    except Exception as error:
        raise Exception(f"Failed to get scene: {error}")

@mcp_server.tool(description=TOOL_DESCRIPTIONS["add_nodes"])
async def add_nodes(nodes: List[Node]) -> ClientResponse:
    try:
      msg_id = str(uuid.uuid4())
      payload = {
          "id": msg_id,
          "message": "add_nodes",
          "type": "add_nodes",
          "data": [node.model_dump() for node in nodes]
      }
      answer = await _send_request(payload)
      return ClientResponse(**answer)
        
    except Exception as error:
        raise Exception(f"Failed to add nodes: {error}")

@mcp_server.tool(description=TOOL_DESCRIPTIONS["add_members"])
async def add_members(members: List[Member]) -> ClientResponse:
    try:
        # Generate a unique ID for the message
        msg_id = str(uuid.uuid4())
        payload = {
          "id": msg_id,
          "message": "add_members",
          "type": "add_members",
          "data": [member.model_dump() for member in members]
        }
        
        answer = await _send_request(payload)
        return ClientResponse(**answer)       
    except Exception as error:
        raise Exception(f"Failed to add members: {error}")

@mcp_server.tool(description=TOOL_DESCRIPTIONS["add_bc"])
async def add_bc(bcs: List[BoundaryCondition]) -> ClientResponse:
    try:
      # Generate a unique ID for the message
      msg_id = str(uuid.uuid4())
      payload = {
        "id": msg_id,
        "message": "add_bc",
        "type": "add_bc",
        "data": [bc.model_dump() for bc in bcs]
      }
        
      answer = await _send_request(payload)
      return ClientResponse(**answer)
        
    except Exception as error:
      raise Exception(f"Failed to add boundary conditions: {error}")

@mcp_server.tool(description=TOOL_DESCRIPTIONS["add_linear_load"])
async def add_linear_load(loads: List[LinearLoad]) -> ClientResponse:
    try:
      # Generate a unique ID for the message
      msg_id = str(uuid.uuid4())
      payload = {
        "id": msg_id,
        "message": "add_linear_load",
        "type": "add_linear_load",
        "data": [load.model_dump() for load in loads]
      }
        
      answer = await _send_request(payload)
      return ClientResponse(**answer)
        
    except Exception as error:
        raise Exception(f"Failed to add linear loads: {error}")
        
async def _wait_for_response(msg_id: str, timeout: float = 10.0) -> dict:
    """Wait for WebSocket response with timeout"""
    start_time = time.time()
    
    while (time.time() - start_time) < timeout:
        answer = next((msg for msg in messages if msg.get("id") == msg_id), None)
        if answer:
            messages.remove(answer)  # Cleanup
            return answer
        await asyncio.sleep(0.1)
    
    raise Exception(f"Timeout waiting for response (ID: {msg_id})")

async def _send_request(payload: dict) -> dict:
    """Send request and wait for response"""
    global client_connection
    
    if not client_connection:
        raise Exception("No WebSocket client connected")
    
    await client_connection.send_text(json.dumps(payload))
    return await _wait_for_response(payload["id"])
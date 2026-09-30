"""
Resources API endpoints
"""
from fastapi import APIRouter
from typing import List
from app.models.response import Resource
from app.services.response import ResponseService

router = APIRouter()

@router.get("", response_model=List[Resource])
def get_resources():
    return ResponseService.get_all_resources()

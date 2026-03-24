from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional, List

class WebAppBase(BaseModel):
    name: str
    url: HttpUrl
    description: str
    category: str
    target_audience: str
    key_features: List[str] = []
    logo: Optional[str] = None
    is_active: bool = True
    brand_voice: Optional[str] = None
    market_location: Optional[str] = None
    content_goals: Optional[str] = None

class WebAppCreate(WebAppBase):
    pass

class WebAppUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[HttpUrl] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_audience: Optional[str] = None
    key_features: Optional[List[str]] = None
    logo: Optional[str] = None
    is_active: Optional[bool] = None
    brand_voice: Optional[str] = None
    market_location: Optional[str] = None
    content_goals: Optional[str] = None

class WebApp(WebAppBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

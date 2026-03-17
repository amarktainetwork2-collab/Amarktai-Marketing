from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional, Any
from app.models.platform_connection import PlatformType

class PlatformConnectionBase(BaseModel):
    platform: PlatformType
    account_name: str
    account_id: str
    is_active: bool = True

class PlatformConnectionCreate(PlatformConnectionBase):
    pass

class PlatformConnection(PlatformConnectionBase):
    id: str
    user_id: str
    connected_at: datetime
    expires_at: Optional[datetime] = None
    monthly_ad_budget: Optional[Decimal] = None
    daily_ad_budget: Optional[Decimal] = None
    ad_budget_currency: Optional[str] = "USD"
    ad_account_id: Optional[str] = None
    auto_post_enabled: Optional[bool] = False
    auto_reply_enabled: Optional[bool] = False
    posting_schedule: Optional[Any] = None
    
    class Config:
        from_attributes = True

# [Task]: T-006
# [From]: speckit.plan §5.2, speckit.specify §2.1

from datetime import datetime, timezone
from sqlalchemy import text
from sqlmodel import Session
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

EXCLUDED_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in EXCLUDED_PATHS:
            return await call_next(request)

        # Allow CORS preflight requests through
        if request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        token = auth_header.removeprefix("Bearer ").strip()

        try:
            from db import engine
            with Session(engine) as db:
                row = db.execute(
                    text('SELECT "userId", "expiresAt" FROM session WHERE token = :token'),
                    {"token": token},
                ).first()

            if not row:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

            user_id, expires_at = row
            now = datetime.now(timezone.utc)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < now:
                return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

            request.state.user_id = user_id
        except Exception:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        return await call_next(request)

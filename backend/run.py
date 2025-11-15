#!/usr/bin/env python3
"""
Startup script for the Red Team Evolution Backend API
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"""
╔══════════════════════════════════════════════════════════════════╗
║        Red Team Evolution Backend - Starting Server             ║
╚══════════════════════════════════════════════════════════════════╝

Environment: {settings.ENVIRONMENT}
Host: {settings.HOST}
Port: {settings.PORT}
CORS Origins: {settings.cors_origins_list}

API Docs will be available at: http://{settings.HOST}:{settings.PORT}/docs
""")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )

from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Optional, Dict, Any
import time
import logging
from pydantic import BaseModel, validator
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnalysisRequest(BaseModel):
    repo_url: str
    branch: Optional[str] = "main"
    include_patterns: Optional[list] = ["**/*.py", "**/*.js", "**/*.java", "**/*.go", "**/*.rs"]
    exclude_patterns: Optional[list] = ["**/node_modules/**", "**/__pycache__/**", "**/.git/**"]

    @validator('repo_url')
    def validate_repo_url(cls, v):
        if not (v.startswith('http://') or v.startswith('https://') or v.startswith('git@')):
            raise ValueError('Repository URL must be a valid HTTP/HTTPS URL or git SSH URL')
        return v


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    uptime: float


security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if not token.startswith("valid_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": token.split("_")[1] if "_" in token else "anonymous"}


class APIGateway:
    def __init__(self):
        self.app = FastAPI(
            title="Code Quality Analyzer API",
            description="API for analyzing code quality in projects",
            version="1.0.0"
        )
        self.start_time = time.time()

        self.limiter = Limiter(key_func=get_remote_address)
        self.app.state.limiter = self.limiter
        self.app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["https://example.com", "http://localhost:3000"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @self.app.middleware("http")
        async def add_process_time_header(request: Request, call_next):
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            logger.info(f"Request processed in {process_time:.3f}s")
            return response

        self._setup_routes()

    def _setup_routes(self):
        @self.app.get("/health", response_model=HealthResponse)
        @self.limiter.limit("100/minute")
        async def health_check(request: Request):
            return {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0",
                "uptime": time.time() - self.start_time
            }

        @self.app.get("/api/v1/public/info")
        @self.limiter.limit("10/minute")
        async def public_info():
            return {
                "service": "Code Quality Analyzer",
                "version": "1.0.0",
                "supported_languages": ["Python", "JavaScript", "Java", "Go", "Rust"],
                "max_project_size": "5GB",
                "rate_limit": "10 requests/minute for free tier"
            }

        @self.app.post("/api/v1/analyze")
        @self.limiter.limit("5/minute")
        async def analyze_code(
            request: Request,
            analysis_request: AnalysisRequest,
            auth: Dict[str, Any] = Depends(verify_token)
        ):
            try:
                task_id = f"task_{int(time.time())}_{auth['user_id']}"
                logger.info(f"Analysis requested for {analysis_request.repo_url} by user {auth['user_id']}")
                return {
                    "task_id": task_id,
                    "status": "queued",
                    "message": "Analysis request accepted and queued for processing",
                    "estimated_time": "2-5 minutes",
                    "check_status_at": f"/api/v1/tasks/{task_id}"
                }
            except Exception as e:
                logger.error(f"Error processing analysis request: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to process analysis request: {str(e)}"
                )

        @self.app.get("/api/v1/tasks/{task_id}")
        async def get_task_status(task_id: str, auth: Dict[str, Any] = Depends(verify_token)):
            return {
                "task_id": task_id,
                "status": "processing",
                "progress": 50,
                "estimated_completion": datetime.utcnow().isoformat(),
                "user_id": auth['user_id']
            }

        @self.app.post("/webhooks/github")
        async def github_webhook(request: Request):
            payload = await request.json()
            event_type = request.headers.get("X-GitHub-Event", "unknown")
            logger.info(f"GitHub webhook received: {event_type}")
            return {
                "status": "accepted",
                "message": "Webhook received and queued for processing",
                "event_type": event_type,
                "timestamp": datetime.utcnow().isoformat()
            }

        @self.app.options("/api/v1/analyze")
        async def cors_preflight():
            return {}


app = APIGateway().app

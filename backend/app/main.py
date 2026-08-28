from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .core.config import settings
from .db.session import get_db
from .routers.analises import router as analises_router
from .routers.catalogo import router as catalogo_router
from .routers.dashboard import router as dashboard_router
from .routers.municipios import router as municipios_router
from .routers.priorizacao import router as priorizacao_router
from .routers.sensibilidade import router as sensibilidade_router
from .schemas.catalogo import ReadinessResponse


app = FastAPI(
    title="AgroESG Intelligence API",
    description="API do projeto de priorização agroambiental da soja",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "projeto": "AgroESG Intelligence",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/ready", response_model=ReadinessResponse)
def ready(db: Session = Depends(get_db)) -> ReadinessResponse:
    try:
        db.execute(text("SELECT 1")).scalar_one()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable.",
        ) from None

    return ReadinessResponse(status="ready", database="available")


app.include_router(analises_router)
app.include_router(catalogo_router)
app.include_router(priorizacao_router)
app.include_router(municipios_router)
app.include_router(sensibilidade_router)
app.include_router(dashboard_router)

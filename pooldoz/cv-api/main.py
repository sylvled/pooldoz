from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import detect

app = FastAPI(title="PoolDoz CV API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:80"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(detect.router)


@app.get("/health")
async def health():
    return {"status": "ok"}

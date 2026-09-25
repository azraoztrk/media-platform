from fastapi import FastAPI

app = FastAPI(
    title="Media Platform API",
    description="Media content management and tracking platform",
    version="1.0.0"
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
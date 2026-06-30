import secrets
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

# import api router
from app.routes.auth import router as auth_router
from app.routes.airline import router as airline_router
from app.routes.route import router as route_router
from app.routes.flight import router as flight_router

# Close Docs url in fast api 
app = FastAPI(
    title="Blue Horizon - Air Ticket Analytics System",
    docs_url=None,   
    redoc_url=None    
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register api router ....
app.include_router(auth_router)
app.include_router(airline_router)
app.include_router(route_router)
app.include_router(flight_router)

# Define user name and password 
security = HTTPBasic()
SWAGGER_USER = "bh_admin"
SWAGGER_PASS = "horizon@2026"

def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, SWAGGER_USER)
    correct_password = secrets.compare_digest(credentials.password, SWAGGER_PASS)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Build custom rout / use password to access docs 
@app.get("/docs", include_in_schema=False)
async def get_documentation(username: str = Depends(get_current_username)):
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Blue Horizon - Secured Swagger UI"
    )

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint(username: str = Depends(get_current_username)):
    return get_openapi(title=app.title, version=app.version, routes=app.routes)


@app.get("/")
def root():
    return {"message": "Welcome to Blue Horizon API Server"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("run:app", host="127.0.0.1", port=8000, reload=True)
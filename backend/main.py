from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router  # Import router instead of app
from schemas import ChatAuthorization
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite's default port
        "http://localhost:5174",  # Alternative Vite port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://0.0.0.0:8000/",
        "http://localhost:3001",
        "http://0.0.0.0:3001"
        #3000 is the port for the frontend
    ],  # Vite's default port change it back to 5173 in the default function
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the router
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Server is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
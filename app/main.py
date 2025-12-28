from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from celery.result import AsyncResult
import hashlib
import aiofiles
from pathlib import Path
import os
from datetime import datetime
import mimetypes
import json

from database import get_db, init_db
from models import Image as ImageModel, UploadLimit
from celery_app import celery_app
import tasks  # Import the module
from elasticsearch_helper import init_elasticsearch, index_image, search_images

app = FastAPI(title="Image Upload Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - restrict in production
    allow_credentials=False,  # Set to False when using wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Configuration
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)
MAX_UPLOADS_PER_IP = int(os.getenv("MAX_UPLOADS_PER_IP", "25"))
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'}

@app.on_event("startup")
async def startup_event():
    """Initialize database and Elasticsearch on startup"""
    await init_db()
    await init_elasticsearch()
    print("Database and Elasticsearch initialized")

def get_client_ip(request: Request) -> str:
    """Get client IP address, considering proxies"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    return request.client.host

async def calculate_file_hash(file_path: str) -> str:
    """Calculate SHA256 hash of file"""
    sha256_hash = hashlib.sha256()
    async with aiofiles.open(file_path, "rb") as f:
        while chunk := await f.read(8192):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()

async def check_upload_limit(ip_address: str, db: AsyncSession) -> bool:
    """Check if IP has reached upload limit"""
    result = await db.execute(
        select(UploadLimit).where(UploadLimit.ip_address == ip_address)
    )
    limit_record = result.scalar_one_or_none()
    
    if limit_record is None:
        return True  # No record yet, allow upload
    
    return limit_record.upload_count < MAX_UPLOADS_PER_IP

async def increment_upload_count(ip_address: str, db: AsyncSession):
    """Increment upload count for IP"""
    result = await db.execute(
        select(UploadLimit).where(UploadLimit.ip_address == ip_address)
    )
    limit_record = result.scalar_one_or_none()
    
    if limit_record is None:
        # Create new record
        limit_record = UploadLimit(ip_address=ip_address, upload_count=1)
        db.add(limit_record)
    else:
        # Increment existing
        limit_record.upload_count += 1
        limit_record.updated_at = datetime.utcnow()
    
    await db.commit()

async def get_upload_count(ip_address: str, db: AsyncSession) -> int:
    """Get current upload count for IP"""
    result = await db.execute(
        select(UploadLimit).where(UploadLimit.ip_address == ip_address)
    )
    limit_record = result.scalar_one_or_none()
    return limit_record.upload_count if limit_record else 0

@app.get("/")
async def root():
    return {
        "message": "Image Upload Service API",
        "endpoints": {
            "upload": "/upload",
            "status": "/status/{task_id}",
            "stats": "/stats",
            "my_uploads": "/my-uploads"
        }
    }

@app.post("/upload")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    name: str = Form(None),
    description: str = Form(""),
    tags: str = Form("[]"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an image with duplicate detection, IP limiting, and metadata
    """
    # Parse tags from JSON string
    try:
        tags_list = json.loads(tags) if tags else []
    except json.JSONDecodeError:
        tags_list = []
    
    # Use provided name or fallback to filename
    image_name = name if name else file.filename
    
    # Get client IP
    client_ip = get_client_ip(request)
    
    # Check upload limit
    if not await check_upload_limit(client_ip, db):
        current_count = await get_upload_count(client_ip, db)
        raise HTTPException(
            status_code=429,
            detail=f"Upload limit reached. You have uploaded {current_count}/{MAX_UPLOADS_PER_IP} images."
        )
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate MIME type
    mime_type = file.content_type
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type. Must be an image."
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Calculate hash for duplicate detection
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Check for duplicate
    result = await db.execute(
        select(ImageModel).where(ImageModel.file_hash == file_hash)
    )
    existing_image = result.scalar_one_or_none()
    
    if existing_image:
        return JSONResponse(
            status_code=200,
            content={
                "message": "Image already exists (duplicate detected)",
                "is_duplicate": True,
                "image_id": existing_image.id,
                "filename": existing_image.filename,
                "url": f"/images/{existing_image.filename}",
                "uploaded_at": existing_image.uploaded_at.isoformat()
            }
        )
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    unique_filename = f"{timestamp}_{file_hash[:12]}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Create database record
    image_record = ImageModel(
        filename=unique_filename,
        original_filename=file.filename,
        name=image_name,
        description=description,
        tags=tags_list,
        file_hash=file_hash,
        file_size=file_size,
        mime_type=mime_type,
        ip_address=client_ip,
        processed=False
    )
    
    db.add(image_record)
    await db.commit()
    await db.refresh(image_record)
    
    # Index in Elasticsearch
    image_url = f"/images/{unique_filename}"
    await index_image(
        image_id=image_record.id,
        name=image_name,
        description=description,
        tags=tags_list,
        url=image_url,
        file_hash=file_hash,
        uploaded_at=image_record.uploaded_at
    )
    
    # Increment upload count for this IP
    await increment_upload_count(client_ip, db)
    
    # Queue image processing task
    task = tasks.process_image.delay(image_record.id, str(file_path))
    
    # Get updated count
    current_count = await get_upload_count(client_ip, db)
    
    return JSONResponse(
        status_code=201,
        content={
            "message": "Image uploaded successfully",
            "is_duplicate": False,
            "image_id": image_record.id,
            "filename": unique_filename,
            "url": f"/images/{unique_filename}",
            "task_id": task.id,
            "file_hash": file_hash,
            "uploads_used": f"{current_count}/{MAX_UPLOADS_PER_IP}"
        }
    )

@app.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """Check the status of an image processing task"""
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == 'PENDING':
        response = {
            'status': 'pending',
            'message': 'Task is waiting in queue'
        }
    elif task_result.state == 'PROCESSING':
        response = {
            'status': 'processing',
            'message': task_result.info.get('status', 'Processing...')
        }
    elif task_result.state == 'SUCCESS':
        response = {
            'status': 'completed',
            'result': task_result.result
        }
    elif task_result.state == 'FAILURE':
        response = {
            'status': 'failed',
            'error': str(task_result.info)
        }
    else:
        response = {
            'status': task_result.state.lower()
        }
    
    return JSONResponse(response)

@app.get("/my-uploads")
async def get_my_uploads(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Get all uploads from current IP address"""
    client_ip = get_client_ip(request)
    
    result = await db.execute(
        select(ImageModel)
        .where(ImageModel.ip_address == client_ip)
        .order_by(ImageModel.uploaded_at.desc())
    )
    images = result.scalars().all()
    
    upload_count = await get_upload_count(client_ip, db)
    
    return {
        "ip_address": client_ip,
        "total_uploads": len(images),
        "uploads_used": f"{upload_count}/{MAX_UPLOADS_PER_IP}",
        "remaining": MAX_UPLOADS_PER_IP - upload_count,
        "images": [
            {
                "id": img.id,
                "filename": img.filename,
                "original_filename": img.original_filename,
                "url": f"/images/{img.filename}",
                "file_size": img.file_size,
                "uploaded_at": img.uploaded_at.isoformat(),
                "processed": img.processed
            }
            for img in images
        ]
    }

@app.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get overall statistics"""
    # Total images
    result = await db.execute(select(func.count(ImageModel.id)))
    total_images = result.scalar()
    
    # Total unique IPs
    result = await db.execute(select(func.count(func.distinct(ImageModel.ip_address))))
    unique_ips = result.scalar()
    
    # Total file size
    result = await db.execute(select(func.sum(ImageModel.file_size)))
    total_size = result.scalar() or 0
    
    # Processed images
    result = await db.execute(
        select(func.count(ImageModel.id)).where(ImageModel.processed == True)
    )
    processed_images = result.scalar()
    
    return {
        "total_images": total_images,
        "unique_uploaders": unique_ips,
        "total_size_mb": round(total_size / 1024 / 1024, 2),
        "processed_images": processed_images,
        "max_uploads_per_ip": MAX_UPLOADS_PER_IP
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/search")
async def search(q: str = ""):
    """
    Search images by name, description, or tags using Elasticsearch
    """
    if not q.strip():
        return {"results": []}
    
    results = await search_images(q)
    return {"results": results, "count": len(results)}

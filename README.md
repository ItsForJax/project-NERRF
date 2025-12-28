# Image Upload Service

A full-stack image upload and search application built with FastAPI, React, PostgreSQL, Elasticsearch, and Celery.

## Features

- Image upload with metadata (name, description, tags)
- Duplicate detection using SHA256 hashing
- IP-based rate limiting (25 uploads per IP)
- Asynchronous image processing with Celery
- Full-text search with Elasticsearch
- As-you-type autocomplete search
- Thumbnail generation
- Docker-based deployment

## Tech Stack

### Backend
- FastAPI - REST API framework
- PostgreSQL - Primary database for image metadata and tracking
- Elasticsearch - Full-text search engine
- Redis - Message broker for Celery
- Celery - Asynchronous task queue
- Nginx - Reverse proxy and static file serving

### Frontend
- React - UI framework
- React Router - Client-side routing
- CSS3 - Styling and animations

## Project Structure

```
image-upload-service/
├── app/                          # Backend application
│   ├── main.py                   # FastAPI application
│   ├── models.py                 # Database models
│   ├── database.py               # Database connection
│   ├── elasticsearch_helper.py   # Elasticsearch functions
│   ├── celery_app.py            # Celery configuration
│   ├── tasks.py                  # Background tasks
│   ├── worker.py                 # Celery worker entry
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile               # Backend container
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── App.js              # Main app component
│   │   └── index.js            # Entry point
│   ├── Dockerfile              # Frontend container
│   └── package.json            # Node dependencies
│
├── nginx/                       # Nginx configuration
│   └── nginx.conf              # Reverse proxy config
│
├── uploads/                     # Uploaded images storage
│   └── thumbs/                 # Thumbnail storage
│
└── docker-compose.yml          # Service orchestration
```

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd image-upload-service
```

2. Start all services:
```bash
docker-compose up -d --build
```

3. Wait for services to be healthy (about 30 seconds):
```bash
docker-compose logs -f
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost
- Elasticsearch: http://localhost:9200

## Usage

### Upload Images

1. Navigate to http://localhost:3000
2. Select an image file (drag & drop or click)
3. Fill in metadata:
   - Name (optional - defaults to filename)
   - Description (optional)
   - Tags (type and press Enter to add)
4. Click "Upload Image"

### Search Images

1. Click "Search" in the navigation
2. Type your search query
3. Results appear as you type (debounced)
4. Click any image to view full details

## API Endpoints

### Upload
```
POST /upload
Content-Type: multipart/form-data

Parameters:
- file: Image file
- name: Image name (optional)
- description: Description (optional)
- tags: JSON array of tags (optional)
```

### Search
```
GET /search?q=query

Returns:
{
  "results": [...],
  "count": 10
}
```

### Other Endpoints
- `GET /status/{task_id}` - Check processing status
- `GET /my-uploads` - Get uploads for current IP
- `GET /stats` - Overall statistics
- `GET /health` - Health check

## Configuration

### Environment Variables

Edit `docker-compose.yml` to configure:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `ELASTICSEARCH_URL` - Elasticsearch connection string
- `MAX_UPLOADS_PER_IP` - Upload limit per IP (default: 25)

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost)

### File Limits

- Max file size: 50MB
- Supported formats: JPG, PNG, GIF, WebP, BMP
- Upload limit: 25 images per IP adress

## How It Works

### Upload Flow

1. User uploads image with metadata
2. FastAPI calculates SHA256 hash
3. Check PostgreSQL for duplicate hash
4. If duplicate: return existing image info
5. If new: save file and create database record
6. Index metadata in Elasticsearch
7. Queue Celery task for thumbnail generation
8. Return success response

### Search Flow

1. User types search query
2. Frontend debounces input (500ms)
3. Request sent to FastAPI `/search` endpoint
4. Elasticsearch performs multi-field fuzzy search
5. Results sorted by relevance and date
6. Thumbnails displayed in grid
7. Click image to view full details in modal

### Data Storage

- PostgreSQL: Image records, upload limits, IP tracking
- Elasticsearch: Searchable metadata (name, description, tags)
- Filesystem: Original images and thumbnails

## Docker Services

The application runs 7 services:

1. **nginx** - Reverse proxy (port 80)
2. **frontend** - React app (port 3000)
3. **fastapi** - Backend API (port 8000)
4. **celery_worker** - Background tasks
5. **postgres** - Database (port 5432)
6. **redis** - Message broker (port 6379)
7. **elasticsearch** - Search engine (port 9200)

## Development

### Running Locally

Backend:
```bash
cd app
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm start
```

### Rebuilding After Changes

Full rebuild:
```bash
docker-compose down
docker-compose up -d --build
```

Rebuild specific service:
```bash
docker-compose up -d --build frontend
```

### Clearing Data

Remove all data:
```bash
docker-compose down -v
docker-compose up -d --build
```

Clear only databases:
```bash
docker-compose exec postgres psql -U imageuser -d imagedb -c "TRUNCATE images, upload_limits CASCADE;"
docker-compose exec elasticsearch curl -X DELETE "localhost:9200/images"
docker-compose restart fastapi
```

## Troubleshooting

### CORS Errors

Make sure `REACT_APP_API_URL` in docker-compose.yml matches your backend URL:
```yaml
environment:
  - REACT_APP_API_URL=http://localhost
```

### Images Not Loading

Check nginx logs:
```bash
docker-compose logs nginx
```

Verify images exist:
```bash
docker-compose exec fastapi ls -la /app/uploads/
```

### Search Not Working

Check if Elasticsearch is running:
```bash
curl http://localhost:9200/_cluster/health
```

Verify index exists:
```bash
curl http://localhost:9200/images/_search?pretty
```

### Service Not Starting

Check logs:
```bash
docker-compose logs <service-name>
```

Common issues:
- Port already in use
- Insufficient memory for Elasticsearch
- Database connection timeout

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 

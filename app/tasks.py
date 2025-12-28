from celery_app import celery_app
from PIL import Image
import hashlib
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Image as ImageModel

# Sync database connection for Celery workers
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://imageuser:imagepass@localhost:5432/imagedb")
sync_engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

@celery_app.task(bind=True)
def process_image(self, image_id: int, file_path: str):
    """
    Process uploaded image:
    - Verify it's a valid image
    - Create thumbnail (optional)
    - Mark as processed in database
    """
    try:
        self.update_state(state='PROCESSING', meta={'status': 'Validating image...'})
        
        # Verify image is valid
        with Image.open(file_path) as img:
            img.verify()
        
        # Re-open for processing (verify closes the file)
        with Image.open(file_path) as img:
            # Get image info
            width, height = img.size
            format_name = img.format
            
            self.update_state(state='PROCESSING', meta={'status': 'Creating thumbnail...'})
            
            # Create thumbnail (optional)
            thumb_path = file_path.replace('/uploads/', '/uploads/thumbs/')
            Path(thumb_path).parent.mkdir(parents=True, exist_ok=True)
            
            img.thumbnail((200, 200))
            img.save(thumb_path, format_name)
        
        # Update database
        db = SessionLocal()
        try:
            image = db.query(ImageModel).filter(ImageModel.id == image_id).first()
            if image:
                image.processed = True
                db.commit()
        finally:
            db.close()
        
        return {
            'status': 'completed',
            'image_id': image_id,
            'width': width,
            'height': height,
            'format': format_name,
            'thumbnail': thumb_path
        }
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        # Clean up file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise

@celery_app.task
def cleanup_old_images():
    """
    Periodic task to clean up old images (run this with celery beat if needed)
    """
    # Implement cleanup logic here
    pass

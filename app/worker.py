"""
Celery worker entry point
This ensures tasks are imported before the worker starts
"""
from celery_app import celery_app
import tasks  # This import registers the tasks

# This is the celery instance that the worker command will use
__all__ = ['celery_app']

from elasticsearch import Elasticsearch, AsyncElasticsearch
import os
import logging

logger = logging.getLogger(__name__)

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")

# Create async Elasticsearch client
es_client = AsyncElasticsearch([ELASTICSEARCH_URL])

INDEX_NAME = "images"

async def init_elasticsearch():
    """Initialize Elasticsearch index with mapping"""
    try:
        # Check if index exists
        exists = await es_client.indices.exists(index=INDEX_NAME)
        
        if not exists:
            # Create index with mapping
            await es_client.indices.create(
                index=INDEX_NAME,
                body={
                    "settings": {
                        "analysis": {
                            "analyzer": {
                                "autocomplete": {
                                    "type": "custom",
                                    "tokenizer": "standard",
                                    "filter": ["lowercase", "autocomplete_filter"]
                                },
                                "autocomplete_search": {
                                    "type": "custom",
                                    "tokenizer": "standard",
                                    "filter": ["lowercase"]
                                }
                            },
                            "filter": {
                                "autocomplete_filter": {
                                    "type": "edge_ngram",
                                    "min_gram": 2,
                                    "max_gram": 20
                                }
                            }
                        }
                    },
                    "mappings": {
                        "properties": {
                            "image_id": {"type": "integer"},
                            "name": {
                                "type": "text",
                                "analyzer": "autocomplete",
                                "search_analyzer": "autocomplete_search",
                                "fields": {
                                    "keyword": {"type": "keyword"}
                                }
                            },
                            "description": {
                                "type": "text",
                                "analyzer": "autocomplete",
                                "search_analyzer": "autocomplete_search"
                            },
                            "tags": {"type": "keyword"},
                            "url": {"type": "keyword"},
                            "thumbnail_url": {"type": "keyword"},
                            "file_hash": {"type": "keyword"},
                            "uploaded_at": {"type": "date"}
                        }
                    }
                }
            )
            logger.info(f"Created Elasticsearch index: {INDEX_NAME}")
        else:
            logger.info(f"Elasticsearch index {INDEX_NAME} already exists")
    except Exception as e:
        logger.error(f"Failed to initialize Elasticsearch: {e}")

async def index_image(image_id: int, name: str, description: str, tags: list, url: str, file_hash: str, uploaded_at):
    """Index an image in Elasticsearch"""
    try:
        # Generate thumbnail URL from main URL
        # /images/filename.png -> /images/thumbs/filename.png
        thumbnail_url = url.replace('/images/', '/images/thumbs/')
        
        doc = {
            "image_id": image_id,
            "name": name,
            "description": description,
            "tags": tags,
            "url": url,
            "thumbnail_url": thumbnail_url,
            "file_hash": file_hash,
            "uploaded_at": uploaded_at.isoformat() if uploaded_at else None
        }
        
        await es_client.index(
            index=INDEX_NAME,
            id=str(image_id),
            document=doc
        )
        logger.info(f"Indexed image {image_id} in Elasticsearch")
        return True
    except Exception as e:
        logger.error(f"Failed to index image in Elasticsearch: {e}")
        return False

async def search_images(query: str, size: int = 50):
    """Search images in Elasticsearch"""
    try:
        # Build search query
        search_body = {
            "query": {
                "multi_match": {
                    "query": query,
                    "fields": ["name^3", "description^2", "tags^2"],
                    "fuzziness": "AUTO"
                }
            },
            "size": size,
            "sort": [
                {"_score": {"order": "desc"}},
                {"uploaded_at": {"order": "desc"}}
            ]
        }
        
        response = await es_client.search(
            index=INDEX_NAME,
            body=search_body
        )
        
        results = []
        for hit in response['hits']['hits']:
            results.append(hit['_source'])
        
        return results
    except Exception as e:
        logger.error(f"Failed to search images in Elasticsearch: {e}")
        return []

async def delete_image(image_id: int):
    """Delete an image from Elasticsearch"""
    try:
        await es_client.delete(
            index=INDEX_NAME,
            id=str(image_id)
        )
        logger.info(f"Deleted image {image_id} from Elasticsearch")
        return True
    except Exception as e:
        logger.error(f"Failed to delete image from Elasticsearch: {e}")
        return False

async def close_elasticsearch():
    """Close Elasticsearch connection"""
    await es_client.close()

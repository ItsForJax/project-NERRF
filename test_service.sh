#!/bin/bash

echo "=== Image Upload Service Test Script ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost/api"

echo "1. Testing health check..."
response=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $response)${NC}"
    exit 1
fi

echo ""
echo "2. Testing stats endpoint..."
curl -s ${BASE_URL}/stats | jq '.'

echo ""
echo "3. Testing image upload..."
# Create a test image
convert -size 100x100 xc:blue /tmp/test_image.jpg 2>/dev/null || {
    echo -e "${YELLOW}ImageMagick not found, creating blank file${NC}"
    echo "fake image content" > /tmp/test_image.jpg
}

upload_response=$(curl -s -X POST ${BASE_URL}/upload -F "file=@/tmp/test_image.jpg")
echo "$upload_response" | jq '.'

# Extract task_id and image URL
task_id=$(echo "$upload_response" | jq -r '.task_id')
image_url=$(echo "$upload_response" | jq -r '.url')

if [ "$task_id" != "null" ]; then
    echo ""
    echo "4. Checking task status..."
    sleep 2
    curl -s ${BASE_URL}/status/${task_id} | jq '.'
fi

if [ "$image_url" != "null" ]; then
    echo ""
    echo "5. Testing image access..."
    full_url="http://localhost${image_url}"
    response=$(curl -s -o /dev/null -w "%{http_code}" ${full_url})
    if [ $response -eq 200 ]; then
        echo -e "${GREEN}✓ Image accessible at ${full_url}${NC}"
    else
        echo -e "${RED}✗ Image not accessible (HTTP $response)${NC}"
    fi
fi

echo ""
echo "6. Testing duplicate upload..."
duplicate_response=$(curl -s -X POST ${BASE_URL}/upload -F "file=@/tmp/test_image.jpg")
is_duplicate=$(echo "$duplicate_response" | jq -r '.is_duplicate')
if [ "$is_duplicate" = "true" ]; then
    echo -e "${GREEN}✓ Duplicate detection working${NC}"
    echo "$duplicate_response" | jq '.'
else
    echo -e "${YELLOW}⚠ Duplicate not detected (might be different image)${NC}"
fi

echo ""
echo "7. Checking my uploads..."
curl -s ${BASE_URL}/my-uploads | jq '.'

echo ""
echo -e "${GREEN}=== Test Complete ===${NC}"
echo ""
echo "You can now:"
echo "  - Upload images: curl -X POST ${BASE_URL}/upload -F 'file=@your_image.jpg'"
echo "  - View images: http://localhost/images/{filename}"
echo "  - Check stats: curl ${BASE_URL}/stats"
echo "  - View your uploads: curl ${BASE_URL}/my-uploads"

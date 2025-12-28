#!/bin/bash

echo "=== Testing Image Upload Service ==="
echo ""

# Test 1: Check if service is up
echo "1. Testing health endpoint..."
curl -s http://localhost/health
echo -e "\n"

# Test 2: Get stats
echo "2. Getting stats..."
curl -s http://localhost/stats | jq '.' || curl -s http://localhost/stats
echo -e "\n"

# Test 3: Check CORS headers
echo "3. Checking CORS headers on /my-uploads..."
curl -s -I http://localhost/my-uploads | grep -i "access-control"
echo ""

# Test 4: Create a simple test image
echo "4. Creating test image..."
if command -v convert &> /dev/null; then
    convert -size 100x100 xc:red /tmp/test_red.jpg
    echo "Created with ImageMagick"
else
    # Create a minimal valid JPEG if ImageMagick is not available
    base64 -d > /tmp/test_red.jpg << 'EOF'
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==
EOF
    echo "Created minimal JPEG"
fi

echo ""
echo "5. Uploading image..."
response=$(curl -s -X POST http://localhost/upload -F "file=@/tmp/test_red.jpg")
echo "$response" | jq '.' || echo "$response"

# Extract info
is_duplicate=$(echo "$response" | jq -r '.is_duplicate' 2>/dev/null || echo "unknown")
filename=$(echo "$response" | jq -r '.filename' 2>/dev/null || echo "unknown")

echo -e "\nIs duplicate: $is_duplicate"
echo "Filename: $filename"

if [ "$filename" != "unknown" ] && [ "$filename" != "null" ]; then
    echo ""
    echo "6. Testing image access..."
    img_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/images/$filename")
    if [ "$img_status" = "200" ]; then
        echo "✓ Image accessible at: http://localhost/images/$filename"
    else
        echo "✗ Image not accessible (HTTP $img_status)"
    fi
fi

echo ""
echo "7. Checking my uploads..."
curl -s http://localhost/my-uploads | jq '.' || curl -s http://localhost/my-uploads

echo ""
echo "=== Test Complete ==="
echo ""
echo "Try uploading via the HTML interface:"
echo "  1. Open test_upload_standalone.html in your browser"
echo "  2. API URL should be: http://localhost"
echo "  3. Upload an image"

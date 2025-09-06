#!/bin/bash

echo "🎨 Favicon Generator for Todolis"
echo "=================================="

# ベースアイコンファイルの確認
BASE_ICON="icon-source.png"

if [ ! -f "$BASE_ICON" ]; then
    echo "❌ Error: $BASE_ICON not found!"
    echo ""
    echo "📝 Please follow these steps:"
    echo "1. Save the handshake icon image as 'icon-source.png' in the project root"
    echo "2. Run this script again: ./generate-favicons.sh"
    echo ""
    echo "💡 Alternative: Use online tool https://realfavicongenerator.net/"
    exit 1
fi

echo "✅ Found base icon: $BASE_ICON"

# 出力ディレクトリの確認
if [ ! -d "public" ]; then
    echo "❌ Error: public directory not found!"
    exit 1
fi

echo "🔄 Generating favicons..."

# メインアイコン (500x500)
echo "  📱 Generating icon.png (500x500)..."
sips -z 500 500 "$BASE_ICON" --out public/icon.png > /dev/null 2>&1

# Apple Touch Icon (180x180)
echo "  🍎 Generating apple-touch-icon.png (180x180)..."
sips -z 180 180 "$BASE_ICON" --out public/apple-touch-icon.png > /dev/null 2>&1

# 32x32 favicon
echo "  🖼️  Generating favicon-32x32.png (32x32)..."
sips -z 32 32 "$BASE_ICON" --out public/favicon-32x32.png > /dev/null 2>&1

# 16x16 favicon
echo "  🖼️  Generating favicon-16x16.png (16x16)..."
sips -z 16 16 "$BASE_ICON" --out public/favicon-16x16.png > /dev/null 2>&1

# メインのfavicon.png (32x32)
echo "  🖼️  Generating favicon.png (32x32)..."
sips -z 32 32 "$BASE_ICON" --out public/favicon.png > /dev/null 2>&1

# favicon.ico (32x32のPNGをコピー、実際のICOファイルではないが互換性あり)
echo "  🖼️  Generating favicon.ico..."
cp public/favicon-32x32.png public/favicon.ico

echo ""
echo "✅ Favicon generation completed!"
echo ""
echo "📋 Generated files:"
echo "  - public/icon.png (500x500)"
echo "  - public/apple-touch-icon.png (180x180)"
echo "  - public/favicon-32x32.png (32x32)"
echo "  - public/favicon-16x16.png (16x16)"
echo "  - public/favicon.png (32x32)"
echo "  - public/favicon.ico (32x32 PNG)"
echo ""
echo "🚀 Your favicons are ready!"
echo ""
echo "💡 Note: For proper .ico format, consider using:"
echo "   - Online converter: https://convertico.com/"
echo "   - ImageMagick: brew install imagemagick"

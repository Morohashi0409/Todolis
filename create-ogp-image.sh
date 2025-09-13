#!/bin/bash

# OGP画像作成スクリプト
# 1200x630pxのOGP画像を作成

# ImageMagickがインストールされているかチェック
if ! command -v convert &> /dev/null; then
    echo "ImageMagickがインストールされていません。"
    echo "macOSの場合: brew install imagemagick"
    echo "Ubuntuの場合: sudo apt-get install imagemagick"
    exit 1
fi

# 元のアイコンファイル
SOURCE_ICON="public/icon.png"
OGP_IMAGE="public/ogp-image.png"

# 1200x630pxの背景を作成（白背景）
convert -size 1200x630 xc:white "$OGP_IMAGE"

# アイコンを中央に配置（適切なサイズにリサイズ）
convert "$OGP_IMAGE" "$SOURCE_ICON" -gravity center -composite "$OGP_IMAGE"

# テキストを追加（オプション）
convert "$OGP_IMAGE" \
    -font Arial-Bold \
    -pointsize 48 \
    -fill "#333333" \
    -gravity center \
    -annotate +0+100 "Taskel" \
    -pointsize 24 \
    -annotate +0+150 "続ける力を、シェアしよう" \
    "$OGP_IMAGE"

echo "OGP画像が作成されました: $OGP_IMAGE"
echo "HTMLファイルのog:imageとtwitter:imageのURLを更新してください。"

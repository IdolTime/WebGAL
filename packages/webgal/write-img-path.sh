#!/bin/bash

# 定义图片文件目录路径
IMG_DIR="src/assets/imgs"

# 输出文件路径
OUTPUT_FILE="src/Core/util/defaultImages.ts"

# 定义支持的图片扩展名
IMAGE_EXTENSIONS="jpg|jpeg|png|gif|bmp|svg|webp"

# 清空或创建 defaultImages.ts 文件，并写入初始的 export 语句
echo "export const defaultImages = [" > "$OUTPUT_FILE"

# 遍历目录下的所有图片文件，将文件名加入数组并写入到文件
find "$IMG_DIR" -type f | grep -E "\.($IMAGE_EXTENSIONS)$" | sed 's|.*/||' | sed 's/^/  "/' | sed 's/$/",/' >> "$OUTPUT_FILE"

# 移除最后一个逗号并添加结束方括号
sed -i '' '$ s/,$//' "$OUTPUT_FILE"
echo "]" >> "$OUTPUT_FILE"

# 打印提示
echo "图片文件名已写入到 $OUTPUT_FILE"

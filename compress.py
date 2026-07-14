# -*- coding: utf-8 -*-
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
from PIL import Image

photos_dir = r"D:\small progect\与秦彻的恋爱日常\photos"
MAX_SIZE = (1200, 1200)  # 最大宽高
QUALITY = 80  # JPG 质量

# 先备份
backup_dir = photos_dir + "_backup"
if not os.path.exists(backup_dir):
    os.makedirs(backup_dir)

files = [f for f in os.listdir(photos_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]

print(f"找到 {len(files)} 张图片\n")

for f in files:
    path = os.path.join(photos_dir, f)
    backup_path = os.path.join(backup_dir, f)

    # 备份原图
    if not os.path.exists(backup_path):
        os.rename(path, backup_path)

    try:
        img = Image.open(backup_path)
        original_size = os.path.getsize(backup_path)

        # 转 RGB（处理 PNG 透明背景 → 白色）
        if img.mode in ('RGBA', 'P'):
            rgb = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb

        # 缩放
        w, h = img.size
        if w > MAX_SIZE[0] or h > MAX_SIZE[1]:
            ratio = min(MAX_SIZE[0] / w, MAX_SIZE[1] / h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

        # 保存为 JPG
        new_name = os.path.splitext(f)[0] + '.jpg'
        new_path = os.path.join(photos_dir, new_name)
        img.save(new_path, 'JPEG', quality=QUALITY, optimize=True)

        new_size = os.path.getsize(new_path)
        reduction = (1 - new_size / original_size) * 100
        print(f"[OK] {f} -> {new_name}")
        print(f"   {original_size/1024/1024:.1f}MB -> {new_size/1024/1024:.1f}MB (-{reduction:.0f}%)\n")

    except Exception as e:
        print(f"[ERR] {f}: {e}\n")
        # 恢复原文件
        if os.path.exists(backup_path):
            os.rename(backup_path, os.path.join(photos_dir, f))

print("完成！原图备份在 photos_backup 文件夹")

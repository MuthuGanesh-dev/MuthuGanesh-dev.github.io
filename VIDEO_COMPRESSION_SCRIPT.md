# 🎬 Video Compression & Optimization Guide

## 🎯 Why Compress Videos?

- Faster website loading
- Lower bandwidth costs
- Better user experience
- Fits within Git LFS limits

---

## 🛠️ Tools Required

### Option 1: FFmpeg (Command Line)

**Install:**

```bash
# Windows (using chocolatey)
choco install ffmpeg

# Mac
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

### Option 2: HandBrake (GUI)
Download from: https://handbrake.fr/

---

## 📏 Recommended Video Settings for Web

### For Portfolio Projects (Good Quality, Smaller Size)

```
Format: MP4 (H.264)
Resolution: 1920x1080 or 1280x720
Bitrate: 2-5 Mbps
Audio: AAC 128kbps
Target Size: < 20MB per minute
```

---

## 🎬 FFmpeg Compression Commands

### 1. Basic Compression (Balanced Quality)

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k output.mp4
```

**Explanation:**
- `-crf 28` → Constant Rate Factor (18-28 is good, higher = smaller file)
- `-preset medium` → Speed vs compression balance
- `-b:a 128k` → Audio bitrate (128kbps is sufficient)

### 2. High Compression (Smaller Files)

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 32 -preset slow -c:a aac -b:a 96k output.mp4
```

**Result:** ~60-70% smaller than original

### 3. Resize + Compress (For Mobile Videos)

```bash
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 -preset medium -c:a aac output.mp4
```

**Result:** 720p video (good for demos)

### 4. Ultra Compression (Maximum Size Reduction)

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 35 -preset veryslow -vf scale=1280:720 -c:a aac -b:a 64k output.mp4
```

**Result:** ~80-85% smaller, acceptable quality

### 5. Target Specific File Size (e.g., under 10MB)

```bash
# Calculate bitrate for 10MB file:
# File size (MB) * 8192 / duration (seconds) = bitrate (kbps)

# For a 60-second video to be 10MB:
ffmpeg -i input.mp4 -b:v 1365k -maxrate 1365k -bufsize 2730k -c:a aac -b:a 128k output.mp4
```

### 6. Batch Convert All Videos

**Windows (PowerShell):**
```powershell
Get-ChildItem -Filter *.mp4 | ForEach-Object {
    $output = "compressed_" + $_.Name
    ffmpeg -i $_.Name -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k $output
}
```

**Mac/Linux (Bash):**
```bash
for video in *.mp4; do
    ffmpeg -i "$video" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k "compressed_$video"
done
```

---

## 📊 Check Video Information

```bash
# Get video details (size, bitrate, duration)
ffmpeg -i input.mp4 2>&1 | grep -E "Duration|bitrate|Stream"

# Or use mediainfo
mediainfo input.mp4
```

---

## 🎯 Compression Presets by Use Case

### Demo Videos (Screen Recordings)
```bash
# Screen recordings compress very well
ffmpeg -i screen-recording.mp4 -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 96k output.mp4
```

### Product Showcases (Need Good Quality)
```bash
ffmpeg -i showcase.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k output.mp4
```

### Background Videos (Lower Priority)
```bash
ffmpeg -i background.mp4 -c:v libx264 -crf 32 -preset medium -vf scale=1280:720 -c:a aac -b:a 64k output.mp4
```

---

## 🔄 Convert to Web-Optimized Format (WebM)

```bash
# WebM often provides better compression than MP4
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus -b:a 96k output.webm
```

---

## 📦 Create Multiple Quality Versions

```bash
# High quality (for fast connections)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 output_hq.mp4

# Medium quality (default)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 output_mq.mp4

# Low quality (for slow connections)
ffmpeg -i input.mp4 -c:v libx264 -crf 32 -vf scale=1280:720 output_lq.mp4
```

---

## 🎬 Extract Still Images (Thumbnails)

```bash
# Extract frame at 5 seconds as thumbnail
ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 thumbnail.jpg

# Extract multiple thumbnails
ffmpeg -i input.mp4 -vf fps=1/10 thumbnail_%03d.jpg
```

---

## 🚀 Automated Compression Script

Create `compress-videos.ps1` (Windows) or `compress-videos.sh` (Mac/Linux):

```powershell
# compress-videos.ps1
$videosPath = "my-app\public\videos"
$outputPath = "my-app\public\videos\compressed"

# Create output directory
New-Item -ItemType Directory -Force -Path $outputPath

Get-ChildItem -Path $videosPath -Filter *.mp4 | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = Join-Path $outputPath $_.Name
    
    Write-Host "Compressing: $($_.Name)"
    
    ffmpeg -i $inputFile `
        -c:v libx264 `
        -crf 28 `
        -preset medium `
        -c:a aac `
        -b:a 128k `
        $outputFile `
        -y
    
    # Show size comparison
    $originalSize = (Get-Item $inputFile).Length / 1MB
    $compressedSize = (Get-Item $outputFile).Length / 1MB
    $savings = [math]::Round((1 - $compressedSize/$originalSize) * 100, 2)
    
    Write-Host "Original: $([math]::Round($originalSize, 2)) MB"
    Write-Host "Compressed: $([math]::Round($compressedSize, 2)) MB"
    Write-Host "Savings: $savings%`n"
}

Write-Host "Compression complete!"
```

**Run it:**
```bash
powershell -ExecutionPolicy Bypass -File compress-videos.ps1
```

---

## 📱 Mobile-Friendly Video Settings

```bash
# Optimize for mobile viewing
ffmpeg -i input.mp4 \
    -vf scale=1280:720 \
    -c:v libx264 \
    -profile:v baseline \
    -level 3.0 \
    -crf 28 \
    -preset medium \
    -movflags +faststart \
    -c:a aac \
    -b:a 96k \
    mobile-output.mp4
```

**Key points:**
- `-movflags +faststart` → Enables progressive loading
- `-profile:v baseline` → Maximum compatibility
- 720p resolution → Good for mobile

---

## ⚙️ CRF (Quality) Reference Guide

```
CRF Value | Quality    | Use Case
----------|------------|------------------------
18-22     | Excellent  | High-quality showcases
23-27     | Good       | General purpose (recommended)
28-32     | Acceptable | Demo videos, tutorials
33-35     | Poor       | Ultra compression only
```

---

## 💾 Size Reduction Examples

### Real-World Results:

| Original | Resolution | After Compression | Savings |
|----------|-----------|------------------|---------|
| 85 MB    | 1920x1080 | 12 MB (CRF 28)  | 86%     |
| 120 MB   | 1920x1080 | 18 MB (CRF 28)  | 85%     |
| 45 MB    | 1280x720  | 8 MB (CRF 30)   | 82%     |

---

## 🔍 Quality Check After Compression

Always review compressed videos:

1. Play the video
2. Check for visible artifacts
3. Ensure audio is clear
4. Verify file size is acceptable

If quality is poor, try:
- Lower CRF (e.g., 26 instead of 30)
- Use slower preset (slow/veryslow)
- Increase audio bitrate

---

## 📋 Compression Checklist

- [ ] Install FFmpeg
- [ ] Identify videos to compress
- [ ] Choose appropriate CRF value
- [ ] Run compression command
- [ ] Verify compressed video quality
- [ ] Replace original with compressed version
- [ ] Update Git repository
- [ ] Test video loading on website

---

## 🎓 Pro Tips

1. **Always keep originals** - Store uncompressed versions elsewhere
2. **Test different CRF values** - Find sweet spot for your content
3. **Use slow preset** - Better compression for videos you compress once
4. **Progressive encoding** - Use `-movflags +faststart` for web videos
5. **Consistent settings** - Use same settings for all portfolio videos

---

## 🆘 Need Help?

Common issues:

**Audio out of sync:**
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -vsync 1 output.mp4
```

**Video too dark after compression:**
```bash
ffmpeg -i input.mp4 -vf eq=brightness=0.06 -c:v libx264 -crf 28 output.mp4
```

**Pixelated/blocky video:**
→ Lower CRF value (better quality)
→ Use slower preset
→ Increase bitrate

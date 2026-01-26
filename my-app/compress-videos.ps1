# Video Compression Script for Portfolio Project
# Compresses all videos in public/videos folder

$videosPath = ".\public\videos"
$outputPath = ".\public\videos\compressed"

# Colors for output
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }

# Check if FFmpeg is installed
try {
    $null = ffmpeg -version 2>$null
} catch {
    Write-Warning "FFmpeg is not installed!"
    Write-Info "Install with: choco install ffmpeg"
    Write-Info "Or download from: https://ffmpeg.org/download.html"
    exit 1
}

# Create output directory
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
    Write-Success "Created output directory: $outputPath"
}

# Find all video files
$videos = Get-ChildItem -Path $videosPath -Include *.mp4,*.mov,*.avi,*.webm -File

if ($videos.Count -eq 0) {
    Write-Warning "No video files found in $videosPath"
    exit 0
}

Write-Info "`nFound $($videos.Count) video(s) to compress`n"

$totalOriginal = 0
$totalCompressed = 0

foreach ($video in $videos) {
    $inputFile = $video.FullName
    $outputFile = Join-Path $outputPath $video.Name
    
    # Skip if already compressed
    if (Test-Path $outputFile) {
        Write-Warning "Skipping $($video.Name) (already compressed)"
        continue
    }
    
    Write-Info "Processing: $($video.Name)"
    
    # Compress with optimal settings for web
    $ffmpegArgs = @(
        '-i', $inputFile,
        '-c:v', 'libx264',
        '-crf', '28',
        '-preset', 'medium',
        '-movflags', '+faststart',
        '-c:a', 'aac',
        '-b:a', '128k',
        $outputFile,
        '-y'
    )
    
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        # Calculate size reduction
        $originalSize = (Get-Item $inputFile).Length / 1MB
        $compressedSize = (Get-Item $outputFile).Length / 1MB
        $savings = [math]::Round((1 - $compressedSize/$originalSize) * 100, 2)
        
        $totalOriginal += $originalSize
        $totalCompressed += $compressedSize
        
        Write-Success "  ✓ Original: $([math]::Round($originalSize, 2)) MB"
        Write-Success "  ✓ Compressed: $([math]::Round($compressedSize, 2)) MB"
        Write-Success "  ✓ Savings: $savings%`n"
    } else {
        Write-Warning "  ✗ Failed to compress $($video.Name)`n"
    }
}

# Summary
if ($totalOriginal -gt 0) {
    $totalSavings = [math]::Round((1 - $totalCompressed/$totalOriginal) * 100, 2)
    
    Write-Success "`n=========================================="
    Write-Success "COMPRESSION SUMMARY"
    Write-Success "=========================================="
    Write-Success "Total Original Size: $([math]::Round($totalOriginal, 2)) MB"
    Write-Success "Total Compressed Size: $([math]::Round($totalCompressed, 2)) MB"
    Write-Success "Total Savings: $totalSavings%"
    Write-Success "==========================================`n"
    
    Write-Info "Compressed videos saved to: $outputPath"
    Write-Info "`nNext steps:"
    Write-Info "1. Review compressed videos for quality"
    Write-Info "2. Replace originals if satisfied"
    Write-Info "3. Delete compressed folder"
    Write-Info "4. Run: git add public/videos/"
}

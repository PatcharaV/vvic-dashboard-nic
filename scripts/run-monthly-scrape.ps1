$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $ProjectRoot "backend\data\logs"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "auto-scrape-$Timestamp.log"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
Set-Location $ProjectRoot

function Write-Log {
    param([string]$Message)
    $Line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"), $Message
    $Line | Tee-Object -FilePath $LogFile -Append
}

Write-Log "NIC Dashboard monthly scrape started."
Write-Log "Project root: $ProjectRoot"

$Month = (Get-Date).ToString("MMM", [System.Globalization.CultureInfo]::InvariantCulture).ToUpperInvariant()
$Year = (Get-Date).Year

Write-Log "Scrape period: $Month $Year"

try {
    $Python = (Get-Command python.exe -ErrorAction Stop).Source
    Write-Log "Python executable: $Python"

    $Output = & $Python "tools\monthly_scrape_snapshot.py" --month $Month --year $Year 2>&1
    $ExitCode = $LASTEXITCODE
    $Output | Tee-Object -FilePath $LogFile -Append
} catch {
    Write-Log "NIC Dashboard monthly scrape crashed before completion."
    Write-Log $_.Exception.Message
    exit 1
}

if ($ExitCode -ne 0) {
    Write-Log "NIC Dashboard monthly scrape failed with exit code $ExitCode."
    exit $ExitCode
}

try {
    $Npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
    if ($Npm) {
        Write-Log "Building frontend snapshot with npm."
        Push-Location (Join-Path $ProjectRoot "frontend")
        try {
            $BuildOutput = & $Npm run build 2>&1
            $BuildExitCode = $LASTEXITCODE
            $BuildOutput | Tee-Object -FilePath $LogFile -Append
        } finally {
            Pop-Location
        }
        if ($BuildExitCode -ne 0) {
            Write-Log "Frontend build failed with exit code $BuildExitCode."
            exit $BuildExitCode
        }
    } else {
        Write-Log "npm.cmd was not found. Skipping frontend build."
    }
} catch {
    Write-Log "Frontend build crashed before completion."
    Write-Log $_.Exception.Message
    exit 1
}

Write-Log "NIC Dashboard monthly scrape completed successfully."
exit 0

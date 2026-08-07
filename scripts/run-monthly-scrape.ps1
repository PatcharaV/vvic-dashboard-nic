$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogDir = Join-Path $ProjectRoot "backend\data\logs"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$LogFile = Join-Path $LogDir "auto-scrape-$Timestamp.log"
if ([string]::IsNullOrWhiteSpace($env:SCRAPE_TASK_TIMEOUT_MINUTES)) {
    $TaskTimeoutMinutes = 15
} else {
    $TaskTimeoutMinutes = [int]$env:SCRAPE_TASK_TIMEOUT_MINUTES
}
$TaskTimeoutMilliseconds = $TaskTimeoutMinutes * 60 * 1000

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
    Write-Log "Task timeout: $TaskTimeoutMinutes minutes"

    $StdOutFile = Join-Path $LogDir "auto-scrape-$Timestamp.stdout.log"
    $StdErrFile = Join-Path $LogDir "auto-scrape-$Timestamp.stderr.log"
    $Process = Start-Process `
        -FilePath $Python `
        -ArgumentList @("tools\monthly_scrape_snapshot.py", "--month", $Month, "--year", $Year) `
        -WorkingDirectory $ProjectRoot `
        -RedirectStandardOutput $StdOutFile `
        -RedirectStandardError $StdErrFile `
        -NoNewWindow `
        -PassThru

    if (-not $Process.WaitForExit($TaskTimeoutMilliseconds)) {
        Write-Log "NIC Dashboard monthly scrape exceeded $TaskTimeoutMinutes minutes. Stopping process $($Process.Id)."
        Stop-Process -Id $Process.Id -Force
        $LockFile = Join-Path $ProjectRoot "backend\data\monthly_scrape.lock"
        if (Test-Path $LockFile) {
            Remove-Item -LiteralPath $LockFile -Force
            Write-Log "Removed stale scrape lock after timeout."
        }
        if (Test-Path $StdOutFile) {
            Get-Content $StdOutFile | Tee-Object -FilePath $LogFile -Append
        }
        if (Test-Path $StdErrFile) {
            Get-Content $StdErrFile | Tee-Object -FilePath $LogFile -Append
        }
        exit 124
    }

    $ExitCode = $Process.ExitCode
    if (Test-Path $StdOutFile) {
        Get-Content $StdOutFile | Tee-Object -FilePath $LogFile -Append
    }
    if (Test-Path $StdErrFile) {
        Get-Content $StdErrFile | Tee-Object -FilePath $LogFile -Append
    }
} catch {
    Write-Log "NIC Dashboard monthly scrape crashed before completion."
    Write-Log $_.Exception.Message
    exit 1
}

if ($ExitCode -ne 0) {
    Write-Log "NIC Dashboard monthly scrape failed with exit code $ExitCode."
    exit $ExitCode
}

$RunFrontendBuild = $env:RUN_FRONTEND_BUILD -in @("1", "true", "TRUE", "yes", "YES")
if ($RunFrontendBuild) {
    try {
        $Npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
        if ($Npm) {
            Write-Log "Building frontend snapshot with npm."
            Push-Location (Join-Path $ProjectRoot "frontend")
            try {
                $env:NO_COLOR = "1"
                $BuildOutput = & $Npm run build 2>&1
                $BuildExitCode = $LASTEXITCODE
                $BuildOutput | ForEach-Object { Write-Log $_ }
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
} else {
    Write-Log "Skipping frontend build. Set RUN_FRONTEND_BUILD=true to enable it."
}

Write-Log "NIC Dashboard monthly scrape completed successfully."
exit 0

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonPath = Join-Path $projectRoot ".venv\Scripts\python.exe"
$frontendPath = Join-Path $projectRoot "frontend"
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue

if (-not (Test-Path $pythonPath)) {
    throw "Python environment not found. Run .\scripts\setup.ps1 first."
}
if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    throw "Frontend dependencies not found. Run .\scripts\setup.ps1 first."
}
if (-not $npmCommand) {
    throw "npm.cmd is missing from PATH. Install Node.js and npm, then run setup."
}

$backendPath = Join-Path $projectRoot "backend"
$backendArguments = @("-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000")
$backendEnvFile = Join-Path $backendPath ".env"
if (Test-Path $backendEnvFile) {
    $backendArguments += @("--env-file", "`"$backendEnvFile`"")
}
$backendProcess = Start-Process `
    -FilePath $pythonPath `
    -ArgumentList $backendArguments `
    -WorkingDirectory $backendPath `
    -PassThru
$frontendProcess = Start-Process `
    -FilePath $npmCommand.Source `
    -ArgumentList @("run", "dev", "--", "--hostname", "127.0.0.1") `
    -WorkingDirectory $frontendPath `
    -PassThru

function Wait-ForHttp {
    param([string]$Uri, [int]$TimeoutSeconds = 60)
    $stopAt = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $stopAt) {
        try {
            $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) { return }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }
    throw "Service did not respond at $Uri within $TimeoutSeconds seconds."
}

try {
    Wait-ForHttp -Uri "http://127.0.0.1:8000/api/health"
    Wait-ForHttp -Uri "http://127.0.0.1:3000"
}
catch {
    Write-Error "$($_.Exception.Message) Backend PID: $($backendProcess.Id). Frontend PID: $($frontendProcess.Id). Check their windows for startup errors."
    throw
}

Start-Process "http://127.0.0.1:3000"
Write-Output "DriveSense is running at http://127.0.0.1:3000 (PID $($frontendProcess.Id)) and http://127.0.0.1:8000 (PID $($backendProcess.Id))."
Write-Output "Both services run independently in their own processes. Close their windows to stop them."

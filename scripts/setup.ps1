$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

$missing = @()
foreach ($commandName in @("python", "node", "npm")) {
    if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
        $missing += $commandName
    }
}
if ($missing.Count -gt 0) {
    throw "Required tools are missing from PATH: $($missing -join ', '). Install Python 3.11+, Node.js 20.9+, and npm, then run setup again."
}

$pythonVersionNumber = [int](& python -c "import sys; print(sys.version_info.major * 100 + sys.version_info.minor)")
$pythonVersion = & python --version
$nodeMajor = [int](& node -p "process.versions.node.split('.')[0]")
$nodeMinor = [int](& node -p "process.versions.node.split('.')[1]")
if ($pythonVersionNumber -lt 311) {
    throw "Python 3.11 or newer is required. Detected: $pythonVersion"
}
if ($nodeMajor -lt 20 -or ($nodeMajor -eq 20 -and $nodeMinor -lt 9)) {
    throw "Node.js 20.9 or newer is required. Detected: $(& node --version)"
}
Write-Output "Using $pythonVersion and Node.js $(& node --version)."

$environmentPath = Join-Path $projectRoot ".venv"
$pythonPath = Join-Path $environmentPath "Scripts\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Output "Creating Python virtual environment at $environmentPath"
    & python -m venv $environmentPath
    if ($LASTEXITCODE -ne 0) { throw "Python virtual environment creation failed." }
}

Write-Output "Installing backend requirements."
& $pythonPath -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw "Updating pip failed." }
& $pythonPath -m pip install -r (Join-Path $projectRoot "backend\requirements-dev.txt")
if ($LASTEXITCODE -ne 0) { throw "Backend dependency installation failed." }

Write-Output "Installing frontend dependencies."
Push-Location (Join-Path $projectRoot "frontend")
try {
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
}
finally {
    Pop-Location
}

Write-Output "DriveSense setup completed."

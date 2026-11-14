$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonPath = Join-Path $projectRoot ".venv\Scripts\python.exe"
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
$failures = @()

if (-not (Test-Path $pythonPath)) {
    throw "Python environment not found. Run .\scripts\setup.ps1 first."
}
if (-not $npmCommand) {
    throw "npm.cmd is missing from PATH. Install Node.js and npm, then run setup."
}

Write-Output "Running backend tests."
Push-Location (Join-Path $projectRoot "backend")
try {
    & $pythonPath -m pytest -q
    if ($LASTEXITCODE -ne 0) { $failures += "Backend tests" }
}
finally {
    Pop-Location
}

Push-Location (Join-Path $projectRoot "frontend")
try {
    foreach ($check in @(
        @{ Label = "Frontend tests"; Script = "test" },
        @{ Label = "TypeScript check"; Script = "typecheck" },
        @{ Label = "Production build"; Script = "build" }
    )) {
        Write-Output "Running $($check.Label)."
        & $npmCommand.Source "run" $check.Script
        if ($LASTEXITCODE -ne 0) { $failures += $check.Label }
    }
}
finally {
    Pop-Location
}

if ($failures.Count -gt 0) {
    throw "DriveSense checks failed: $($failures -join ', '). See the output above."
}
Write-Output "All DriveSense checks passed."

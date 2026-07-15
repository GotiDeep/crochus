param(
  [ValidateSet('init', 'start', 'stop', 'reset', 'setup', 'status')]
  [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'

$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$LocalPgRoot = Join-Path $WorkspaceRoot 'database\local-pg'
$DataDir = Join-Path $LocalPgRoot 'data'
$LogDir = Join-Path $LocalPgRoot 'logs'
$PidFile = Join-Path $LocalPgRoot 'postgres-wrapper.pid'
$StdOutLog = Join-Path $LogDir 'postgres.stdout.log'
$StdErrLog = Join-Path $LogDir 'postgres.stderr.log'
$SchemaFile = Join-Path $WorkspaceRoot 'database\init\00-schema.sql'
$SeedFile = Join-Path $WorkspaceRoot 'database\init\01-seed.sql'
$PowerShellExe = Join-Path $PSHOME 'powershell.exe'
$DbHost = '127.0.0.1'
$DbPort = 55432
$DbName = 'crochus'
$DbUser = 'postgres'

function Get-PostgresBinDir {
  $baseDir = 'C:\Program Files\PostgreSQL'
  $candidates = Get-ChildItem $baseDir -Directory -ErrorAction SilentlyContinue |
    Sort-Object { [int]$_.Name } -Descending

  foreach ($candidate in $candidates) {
    $binDir = Join-Path $candidate.FullName 'bin'
    if (Test-Path (Join-Path $binDir 'postgres.exe')) {
      return $binDir
    }
  }

  throw 'PostgreSQL binaries were not found. Install PostgreSQL or use Docker.'
}

$BinDir = Get-PostgresBinDir
$InitDbExe = Join-Path $BinDir 'initdb.exe'
$PostgresExe = Join-Path $BinDir 'postgres.exe'
$PsqlExe = Join-Path $BinDir 'psql.exe'
$CreateDbExe = Join-Path $BinDir 'createdb.exe'

New-Item -ItemType Directory -Force -Path $LocalPgRoot, $LogDir | Out-Null

function Test-DatabaseReady {
  $previousPreference = $ErrorActionPreference
  $script:ErrorActionPreference = 'Continue'

  try {
    & $PsqlExe -h $DbHost -p $DbPort -U $DbUser -d postgres -c 'SELECT 1;' *> $null
    return $LASTEXITCODE -eq 0
  } finally {
    $script:ErrorActionPreference = $previousPreference
  }
}

function Wait-ForDatabase {
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    if (Test-DatabaseReady) {
      return
    }

    Start-Sleep -Milliseconds 500
  }

  throw "Local PostgreSQL did not become ready on $DbHost`:$DbPort."
}

function Initialize-Cluster {
  if (Test-Path (Join-Path $DataDir 'PG_VERSION')) {
    Write-Host "Local PostgreSQL cluster already initialized at $DataDir"
    return
  }

  & $InitDbExe -D $DataDir -U $DbUser -A trust -E UTF8
  if ($LASTEXITCODE -ne 0) {
    throw 'initdb failed.'
  }

  Write-Host "Initialized local PostgreSQL cluster at $DataDir"
}

function Get-WrapperProcess {
  if (-not (Test-Path $PidFile)) {
    return $null
  }

  $wrapperPid = Get-Content $PidFile | Select-Object -First 1
  if (-not $wrapperPid) {
    return $null
  }

  return Get-Process -Id ([int]$wrapperPid) -ErrorAction SilentlyContinue
}

function Start-Cluster {
  if (Test-DatabaseReady) {
    Write-Host "Local PostgreSQL is already running on $DbHost`:$DbPort"
    return
  }

  if ((Test-Path $PidFile) -and -not (Get-WrapperProcess)) {
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  }

  $wrapperCommand = "& '$PostgresExe' -D '$DataDir' -p $DbPort"
  $process = Start-Process `
    -FilePath $PowerShellExe `
    -ArgumentList '-NoProfile', '-Command', $wrapperCommand `
    -WindowStyle Hidden `
    -RedirectStandardOutput $StdOutLog `
    -RedirectStandardError $StdErrLog `
    -PassThru

  $process.Id | Set-Content $PidFile
  Wait-ForDatabase
  Write-Host "Local PostgreSQL started on $DbHost`:$DbPort"
}

function Stop-Cluster {
  $process = Get-WrapperProcess
  if ($process) {
    Stop-Process -Id $process.Id -Force
  }

  if (Test-Path $PidFile) {
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  }

  Write-Host 'Local PostgreSQL stop signal sent.'
}

function Reset-Database {
  Start-Cluster

  & $PsqlExe -h $DbHost -p $DbPort -U $DbUser -d postgres -c "DROP DATABASE IF EXISTS $DbName WITH (FORCE);"
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to drop local Crochus database.'
  }

  & $CreateDbExe -h $DbHost -p $DbPort -U $DbUser $DbName
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to create local Crochus database.'
  }

  & $PsqlExe -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $SchemaFile
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to apply schema.'
  }

  & $PsqlExe -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $SeedFile
  if ($LASTEXITCODE -ne 0) {
    throw 'Failed to apply seed data.'
  }

  Write-Host "Local Crochus database reset and seeded on $DbHost`:$DbPort"
}

function Show-Status {
  if (Test-DatabaseReady) {
    Write-Host "Local PostgreSQL is ready on $DbHost`:$DbPort"
  } else {
    Write-Host 'Local PostgreSQL is not running.'
  }

  if (Test-Path $PidFile) {
    $wrapperPid = Get-Content $PidFile | Select-Object -First 1
    if (Get-WrapperProcess) {
      Write-Host "Wrapper PID: $wrapperPid"
    } else {
      Write-Host "Wrapper PID file is stale: $wrapperPid"
    }
  }

  Write-Host "Data directory: $DataDir"
  Write-Host "Stdout log: $StdOutLog"
  Write-Host "Stderr log: $StdErrLog"
}

switch ($Action) {
  'init' {
    Initialize-Cluster
  }
  'start' {
    Initialize-Cluster
    Start-Cluster
  }
  'stop' {
    Stop-Cluster
  }
  'reset' {
    Initialize-Cluster
    Reset-Database
  }
  'setup' {
    Initialize-Cluster
    Reset-Database
  }
  'status' {
    Show-Status
  }
}

$ErrorActionPreference = 'Stop'
$mysqlDataRoot = Join-Path $env:LOCALAPPDATA 'HEPCO\MySQL'
$mysqlConfig = Join-Path $mysqlDataRoot 'my.ini'
$mysqldExe = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe'
if (!(Test-Path -LiteralPath $mysqlConfig)) { throw 'Local MySQL configuration is missing.' }
if (Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue) { Write-Output 'Port 3306 is already listening; no second instance was started.'; exit 0 }
Start-Process -FilePath $mysqldExe -ArgumentList @("--defaults-file=`"$mysqlConfig`"") -WindowStyle Hidden
Write-Output 'Started the local MySQL process. It is not registered as a Windows service.'

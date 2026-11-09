param([string]$ApiDirectory = (Split-Path -Parent $PSScriptRoot))
$ErrorActionPreference = 'Stop'
$mysqlInstallRoot = 'C:\Program Files\MySQL\MySQL Server 8.4'
$mysqlDataRoot = Join-Path $env:LOCALAPPDATA 'HEPCO\MySQL'
$mysqlExe = Join-Path $mysqlInstallRoot 'bin\mysql.exe'
$mysqldExe = Join-Path $mysqlInstallRoot 'bin\mysqld.exe'
$mysqlConfig = Join-Path $mysqlDataRoot 'my.ini'
$apiEnvironment = Join-Path $ApiDirectory '.env'
if (!(Test-Path -LiteralPath $mysqldExe)) { throw 'MySQL Server 8.4 is not installed.' }
if (Test-Path -LiteralPath $mysqlDataRoot) { throw 'A local MySQL directory already exists. Inspect it before configuring another instance.' }
if (Test-Path -LiteralPath $apiEnvironment) { throw 'The API environment already exists; it will not be overwritten.' }
if (Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue) { throw 'Port 3306 is occupied; no existing instance will be modified.' }
New-Item -ItemType Directory -Path $mysqlDataRoot | Out-Null
$mysqlUserSid = [Security.Principal.WindowsIdentity]::GetCurrent().User
$mysqlAcl = New-Object System.Security.AccessControl.DirectorySecurity
$mysqlAcl.SetOwner($mysqlUserSid)
$mysqlAcl.SetAccessRuleProtection($true, $false)
$mysqlAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($mysqlUserSid, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
$mysqlAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-18'), 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow'))
Set-Acl -LiteralPath $mysqlDataRoot -AclObject $mysqlAcl
$noBom = [Text.UTF8Encoding]::new($false)
$mysqlRootForward = $mysqlDataRoot.Replace('\', '/')
$mysqlInstallForward = $mysqlInstallRoot.Replace('\', '/')
$mysqlConfigText = @"
[mysqld]
basedir="$mysqlInstallForward"
datadir="$mysqlRootForward/data"
port=3306
bind-address=127.0.0.1
mysqlx=0
skip-name-resolve
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
innodb-buffer-pool-size=128M
max-connections=30
log-error="$mysqlRootForward/mysql-error.log"
pid-file="$mysqlRootForward/mysql.pid"
"@
[IO.File]::WriteAllText($mysqlConfig, $mysqlConfigText, $noBom)
$rootPassword = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$appPassword = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$jwtSecret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$secureRootPassword = ConvertTo-SecureString $rootPassword -AsPlainText -Force
[PSCredential]::new('root', $secureRootPassword) | Export-Clixml -LiteralPath (Join-Path $mysqlDataRoot 'root-credential.xml')
$initProcess = Start-Process -FilePath $mysqldExe -ArgumentList @("--defaults-file=`"$mysqlConfig`"", '--initialize') -WindowStyle Hidden -Wait -PassThru
if ($initProcess.ExitCode -ne 0) { throw 'MySQL data initialization failed. Inspect the protected error log locally.' }
$bootstrapSql = Join-Path $mysqlDataRoot 'bootstrap.sql'
$sql = @"
ALTER USER 'root'@'localhost' IDENTIFIED BY '$rootPassword';
CREATE DATABASE hepco_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE hepco_integration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hepco_local'@'127.0.0.1' IDENTIFIED BY '$appPassword';
GRANT ALL PRIVILEGES ON hepco_local.* TO 'hepco_local'@'127.0.0.1';
GRANT ALL PRIVILEGES ON hepco_integration.* TO 'hepco_local'@'127.0.0.1';
"@
[IO.File]::WriteAllText($bootstrapSql, $sql, $noBom)
$serverProcess = Start-Process -FilePath $mysqldExe -ArgumentList @("--defaults-file=`"$mysqlConfig`"", "--init-file=`"$bootstrapSql`"") -WindowStyle Hidden -PassThru
$clientConfig = Join-Path $mysqlDataRoot 'client-bootstrap.cnf'
[IO.File]::WriteAllText($clientConfig, "[client]`nuser=hepco_local`npassword=$appPassword`nhost=127.0.0.1`nport=3306`nprotocol=TCP`n", $noBom)
$ready = $false
for ($attempt = 0; $attempt -lt 25; $attempt++) {
    Start-Sleep -Milliseconds 800
    if ($serverProcess.HasExited) { break }
    $queryOutput = & $mysqlExe "--defaults-extra-file=$clientConfig" --batch --skip-column-names --execute='SELECT VERSION();' 2>$null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
}
if (!$ready) { throw 'MySQL did not become ready. Configuration remains in the protected local directory for diagnosis.' }
$environmentText = "PORT=3000`nDATABASE_URL=mysql://hepco_local:$appPassword@127.0.0.1:3306/hepco_local`nJWT_SECRET=$jwtSecret`nCMS_ADMIN_USER_IDS=`nTRUST_PROXY=`n"
[IO.File]::WriteAllText($apiEnvironment, $environmentText, $noBom)
[IO.File]::WriteAllText((Join-Path $mysqlDataRoot 'integration-url.txt'), "mysql://hepco_local:$appPassword@127.0.0.1:3306/hepco_integration", $noBom)
foreach ($temporaryFile in @($bootstrapSql, $clientConfig)) {
    $resolvedTemporaryFile = [IO.Path]::GetFullPath($temporaryFile)
    if (!$resolvedTemporaryFile.StartsWith([IO.Path]::GetFullPath($mysqlDataRoot) + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected temporary path.' }
    Remove-Item -LiteralPath $resolvedTemporaryFile -Force
}
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$mysqlBin = Join-Path $mysqlInstallRoot 'bin'
if (($userPath -split ';') -notcontains $mysqlBin) { [Environment]::SetEnvironmentVariable('Path', ($userPath.TrimEnd(';') + ';' + $mysqlBin), 'User') }
Write-Output 'MySQL ready on 127.0.0.1:3306.'
Write-Output 'Created isolated databases: hepco_local and hepco_integration.'
Write-Output 'Created API .env with local database credentials; root credentials are encrypted for the Windows account.'
Write-Output 'No application tables, CMS accounts or production data were changed.'

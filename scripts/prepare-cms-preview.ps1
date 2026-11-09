$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $root '.hepco-preview-build'
$backend = Join-Path $root 'HEPCO-API-main'

if (Test-Path -LiteralPath $stage) {
    throw "The staging directory already exists: $stage. Rename it before generating a fresh build."
}

New-Item -ItemType Directory -Path $stage | Out-Null
foreach ($name in 'src', 'public', 'index.html', 'vite.config.js', 'package.json') {
    Copy-Item -LiteralPath (Join-Path $root $name) -Destination $stage -Recurse
}
New-Item -ItemType Directory -Path "$stage/backend/prisma", "$stage/api", "$stage/.vercel" | Out-Null
Copy-Item -LiteralPath "$backend/src" -Destination "$stage/backend" -Recurse
Copy-Item -LiteralPath "$backend/package.json" -Destination "$stage/backend"
Copy-Item -LiteralPath "$backend/prisma/schema.prisma" -Destination "$stage/backend/prisma"
Copy-Item -LiteralPath "$root/.vercel/project.json" -Destination "$stage/.vercel"

$package = Get-Content "$stage/package.json" -Raw | ConvertFrom-Json -AsHashtable
$apiPackage = Get-Content "$backend/package.json" -Raw | ConvertFrom-Json -AsHashtable
foreach ($name in $apiPackage.dependencies.Keys) {
    $package.dependencies[$name] = $apiPackage.dependencies[$name]
}
$package.devDependencies.prisma = $apiPackage.devDependencies.prisma
$package.scripts.postinstall = 'prisma generate --schema backend/prisma/schema.prisma'
$package | ConvertTo-Json -Depth 10 | Set-Content "$stage/package.json"

'export { default } from "../backend/src/index.js";' | Set-Content "$stage/api/cms.js"
@'
{
  "functions": {
    "api/cms.js": { "includeFiles": "node_modules/.prisma/client/**" }
  },
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/cms" },
    { "source": "/Public/Upload/:path*", "destination": "https://www.hepco.com.vn/Public/Upload/:path*" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
'@ | Set-Content "$stage/vercel.json"

$apiFile = "$stage/src/constants/api.js"
(Get-Content $apiFile -Raw).Replace("'http://localhost:3000'", 'window.location.origin') | Set-Content $apiFile
Write-Output $stage

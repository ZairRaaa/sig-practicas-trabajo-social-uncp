[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('backend', 'frontend')]
    [string]$Servicio
)

$ErrorActionPreference = 'Stop'
$projectDirectory = $PSScriptRoot
$serviceDirectory = Join-Path $projectDirectory $Servicio

# Mantener cada servicio en su terminal permite ver errores y detenerlo con Ctrl+C.
Push-Location -LiteralPath $serviceDirectory
try {
    if ($Servicio -eq 'backend') {
        $pythonExecutable = Join-Path $serviceDirectory '.venv\Scripts\python.exe'
        if (-not (Test-Path -LiteralPath $pythonExecutable -PathType Leaf)) {
            throw 'Falta backend/.venv. Sigue la preparación inicial de backend/README.md.'
        }
        if (-not (Test-Path -LiteralPath (Join-Path $serviceDirectory '.env') -PathType Leaf)) {
            throw 'Falta backend/.env. Copia .env.example solo si aún no tienes configuración y completa tus datos locales.'
        }
        Write-Host 'Backend local: http://localhost:8000/docs. Para detener: Ctrl+C.'
        Write-Host 'PostgreSQL debe estar iniciado. Este comando no aplica migraciones.'
        & $pythonExecutable -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    }
    else {
        $npmExecutable = Get-Command npm.cmd -ErrorAction SilentlyContinue
        if ($null -eq $npmExecutable) {
            throw 'No se encontró npm.cmd. Instala Node compatible con frontend/package.json y abre otra terminal.'
        }
        if (-not (Test-Path -LiteralPath (Join-Path $serviceDirectory 'node_modules') -PathType Container)) {
            throw 'Faltan dependencias del frontend. Ejecuta npm ci desde frontend una vez.'
        }
        Write-Host 'Frontend local: http://localhost:5173. Para detener: Ctrl+C.'
        # Evitar que Vite cambie silenciosamente el puerto y deje de coincidir con CORS.
        & $npmExecutable.Source run dev -- --host localhost --port 5173 --strictPort
    }
    if ($LASTEXITCODE -ne 0) {
        throw "El servicio terminó con código $LASTEXITCODE. Consulta el mensaje anterior en esta terminal."
    }
}
finally {
    Pop-Location
}

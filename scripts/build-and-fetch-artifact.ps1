# 双击运行本脚本,会调用 Git Bash 执行 scripts/build-and-fetch-artifact.sh
# 若需要自定义参数(ref/workflow/artifact/output/wwwroot),编辑下面的 $ExtraArgs

$ErrorActionPreference = "Stop"

# 传给 build-and-fetch-artifact.sh 的参数,例如: @("-r", "master", "-n", "dist")
$ExtraArgs = @()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ShellScript = Join-Path $ScriptDir "build-and-fetch-artifact.sh"

if (-not (Test-Path $ShellScript)) {
    Write-Host "错误: 未找到 $ShellScript" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# 查找 Git for Windows 自带的 bash.exe
function Find-Bash {
    $candidates = @()

    $gitCmd = Get-Command git -ErrorAction SilentlyContinue
    if ($gitCmd) {
        $gitRoot = Split-Path -Parent (Split-Path -Parent $gitCmd.Source)
        $candidates += Join-Path $gitRoot "bin\bash.exe"
        $candidates += Join-Path $gitRoot "usr\bin\bash.exe"
    }

    $candidates += "$env:ProgramFiles\Git\bin\bash.exe"
    $candidates += "${env:ProgramFiles(x86)}\Git\bin\bash.exe"

    foreach ($path in $candidates) {
        if ($path -and (Test-Path $path)) {
            return $path
        }
    }

    $bashCmd = Get-Command bash.exe -ErrorAction SilentlyContinue
    if ($bashCmd) {
        return $bashCmd.Source
    }

    return $null
}

$BashExe = Find-Bash
if (-not $BashExe) {
    Write-Host "错误: 未找到 Git Bash (bash.exe),请先安装 Git for Windows: https://git-scm.com/download/win" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

# Windows 路径转成 bash 能识别的 posix 风格路径 (D:\a\b -> /d/a/b)
function Convert-ToPosixPath($winPath) {
    $full = (Resolve-Path $winPath).Path
    $drive = $full.Substring(0, 1).ToLower()
    $rest = $full.Substring(2) -replace '\\', '/'
    return "/$drive$rest"
}

$PosixScript = Convert-ToPosixPath $ShellScript

Write-Host "==> 使用 Git Bash: $BashExe"
Write-Host "==> 执行脚本: $ShellScript"
Write-Host ""

& $BashExe -lc "`"$PosixScript`" $ExtraArgs"
$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "==> 执行成功" -ForegroundColor Green
} else {
    Write-Host "==> 执行失败,退出码: $exitCode" -ForegroundColor Red
}

Read-Host "按回车键退出"
exit $exitCode

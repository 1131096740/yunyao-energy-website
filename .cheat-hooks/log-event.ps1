param(
  [string]$EventType = "unknown"
)

$projectDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { "." }
$cacheDir = Join-Path $projectDir ".cheat-cache"
$logFile = Join-Path $cacheDir "usage.jsonl"

try {
  New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
  $inputText = [Console]::In.ReadToEnd()
  $record = [ordered]@{
    ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    event = $EventType
  }
  if (-not [string]::IsNullOrWhiteSpace($inputText)) {
    try {
      $payload = $inputText | ConvertFrom-Json
      $record.tool = $payload.tool_name
      $record.file = $payload.tool_input.file_path
    } catch {}
  }
  ($record | ConvertTo-Json -Compress) | Add-Content -LiteralPath $logFile
} catch {}

exit 0

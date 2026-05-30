param()

$projectDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { "." }
$stateFile = Join-Path $projectDir ".cheat-state.json"
if (-not (Test-Path -LiteralPath $stateFile)) { exit 0 }

try {
  $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
} catch {
  Write-Output "[cheat-on-content] SessionStart: .cheat-state.json is not valid JSON."
  exit 0
}

$samples = if ($null -ne $state.calibration_samples) { [int]$state.calibration_samples } else { 0 }
$buffer = if ($null -ne $state.shoots) { @($state.shoots).Count } else { 0 }
$pending = if ($null -ne $state.pending_retros) { @($state.pending_retros).Count } else { 0 }

if ($samples -eq 0) {
  $confidence = "red / very low"
} elseif ($samples -le 2) {
  $confidence = "orange / low"
} elseif ($samples -le 5) {
  $confidence = "yellow / still rough"
} elseif ($samples -le 10) {
  $confidence = "green / usable"
} else {
  $confidence = "blue / stronger"
}

Write-Output ""
Write-Output "[cheat-on-content / SessionStart]"
Write-Output "Buffer: $buffer"
Write-Output "Pending retros: $pending"
Write-Output "Calibration samples: $samples | Confidence: $confidence"
Write-Output "Benchmark: $($state.benchmark_status) / $($state.benchmark_name) / samples=$($state.benchmark_sample_count)"
if ($state.hooks_installed -ne $true) {
  Write-Output "Warning: immutability hook is not marked installed."
}
Write-Output ""
exit 0

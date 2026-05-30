param()

if ($env:CHEAT_BYPASS_IMMUTABILITY -eq "1") {
  Write-Error "[cheat-on-content] IMMUTABILITY BYPASS active. Use only for formatting-only fixes."
  exit 0
}

$inputText = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($inputText)) { exit 0 }

try {
  $payload = $inputText | ConvertFrom-Json
} catch {
  exit 0
}

$toolName = $payload.tool_name
$filePath = $payload.tool_input.file_path

if ($toolName -ne "Edit" -and $toolName -ne "Write") { exit 0 }
if ([string]::IsNullOrWhiteSpace($filePath)) { exit 0 }

$normalized = $filePath -replace "\\", "/"
if ($normalized -notmatch "(^|/)predictions/.*\.md$") { exit 0 }

if ($toolName -eq "Write" -and -not (Test-Path -LiteralPath $filePath)) { exit 0 }

if ($toolName -eq "Write" -and (Test-Path -LiteralPath $filePath)) {
  Write-Error @"
[cheat-on-content] BLOCKED: Write would overwrite an existing prediction file:
  $filePath

Use Edit on the retrospective section to append retrospective content.
Use a new '_redo.md' file path to create a redo prediction.
"@
  exit 1
}

if ($toolName -eq "Edit") {
  $oldString = $payload.tool_input.old_string
  if ([string]::IsNullOrEmpty($oldString)) { exit 0 }
  if (-not (Test-Path -LiteralPath $filePath)) { exit 0 }

  $lines = Get-Content -LiteralPath $filePath
  $inPrediction = $false
  $section = New-Object System.Collections.Generic.List[string]

  foreach ($line in $lines) {
    if ($line -match "^##\s+") {
      if ($line -match "^##\s+(预测|Prediction)(\s|$)") {
        $inPrediction = $true
        $section.Add($line)
        continue
      }
      if ($inPrediction) { break }
    }
    if ($inPrediction) { $section.Add($line) }
  }

  if ($section.Count -eq 0) { exit 0 }

  $sectionText = $section -join "`n"
  if ($sectionText.Contains($oldString)) {
    Write-Error @"
[cheat-on-content] BLOCKED: edit targets the prediction section of:
  $filePath

Predictions are immutable. Append only to the retrospective section, or create a new redo file.
"@
    exit 1
  }
}

exit 0

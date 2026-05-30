param(
  [string]$ScriptPath = ".\script.txt",
  [string]$OutPath = ".\assets\narration.wav"
)

Add-Type -AssemblyName System.Speech

$text = Get-Content -LiteralPath $ScriptPath -Raw
$voiceName = "Microsoft Huihui Desktop"

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $fullOutPath = [System.IO.Path]::GetFullPath($OutPath)
  if (Test-Path -LiteralPath $fullOutPath) {
    Remove-Item -LiteralPath $fullOutPath -Force
  }

  $synth.SelectVoice($voiceName)
  $synth.Rate = -1
  $synth.Volume = 100
  $synth.SetOutputToWaveFile($fullOutPath)
  $synth.Speak($text)
}
finally {
  $synth.Dispose()
}

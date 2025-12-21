# Clean up verbose logs from BGV service
$bgvPath = "d:\WinBoard\WinOnboardRun 2\Win-Onboard\Backend\src\services\bgv.service.ts"
$content = Get-Content $bgvPath -Raw

# Comment out all verbose console.logs
$patterns = @(
    "console.log\('🔧",
    "console.log\('🔨",
    "console.log\('📊",
    "console.log\('🔍",
    "console.log\('📋",
    "console.log\('💾",
    "console.log\('📤",
    "console.log\('📎",
    "console.log\('🗑️",
    "console.log\(\`🔧",
    "console.log\(\`📄",
    "console.log\(\`📝",
    "console.log\(\`💼",
    "console.log\(\`👤",
    "console.log\(\`📤"
)

foreach ($pattern in $patterns) {
    $content = $content -replace $pattern, "// console.log$($pattern.Substring(11))"
}

# Keep important initialization logs
$content = $content -replace "// console.log\('✅ BGV tables initialized", "console.log('✅ BGV tables initialized"
$content = $content -replace "// console.log\('✅ BGV service initialized", "console.log('✅ BGV service initialized"

Set-Content $bgvPath $content -NoNewline

Write-Host "✅ BGV service logs cleaned"

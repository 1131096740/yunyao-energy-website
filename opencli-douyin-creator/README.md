# Douyin Creator OpenCLI Adapter

This adapter adds:

```bash
opencli douyin-creator export-operation
```

For OpenCLI 1.8.0 user adapters, use the generated JavaScript version:

```text
D:\Codex-yunyao\opencli-douyin-creator\clis\douyin-creator\export-operation.js
```

This Codex session runs OpenCLI with a workspace-local home:

```powershell
$env:USERPROFILE='D:\Codex-yunyao\opencli-home'
$env:HOME='D:\Codex-yunyao\opencli-home'
```

Then run:

```bash
opencli list
opencli douyin-creator export-operation -f json
```

The command opens `https://creator.douyin.com/creator-micro/data-center/operation` in a browser session and fetches the operation data APIs from the logged-in page context with `credentials: include`.

Useful options:

```bash
opencli douyin-creator export-operation --section overview -f csv
opencli douyin-creator export-operation --section items --limit 50 -f csv
opencli douyin-creator export-operation --section income -f json
opencli douyin-creator export-operation --section billboard -f json
opencli douyin-creator export-operation --section all -f csv
```

Notes:

- It does not print cookies.
- It keeps requests inside the logged-in browser context.
- The first run should be checked with `-v` because Douyin may vary the exact export endpoint by account, date range, or UI version.

# Processing Large Redirector Files (500MB+)

## Overview

For redirector files larger than 50MB, use the standalone command-line processor instead of the web UI. This tool can handle files up to 1GB+ efficiently.

## Quick Start

```bash
cd backend
node process_large_redirector.js <file_path> <target_url> <output_name> [batch_size]
```

## Example

```bash
# Process a 500MB file with 50 concurrent validations
node process_large_redirector.js /path/to/redirects.txt https://yoursite.com my-redirectors 50
```

## Parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `file_path` | Yes | Path to your redirector file | - |
| `target_url` | Yes | Target URL redirectors should point to | - |
| `output_name` | Yes | Name for the output file | - |
| `batch_size` | No | Number of concurrent validations | 50 |

## Features

✅ **Handles any file size** - Tested up to 1GB+
✅ **Low memory usage** - Streams file line-by-line (<200MB RAM)
✅ **Concurrent validation** - Configurable batch size (10-100)
✅ **Real-time progress** - Shows progress for every URL validated
✅ **SQLite persistence** - Saves progress checkpoints
✅ **Only saves valid URLs** - Filters out non-working redirectors
✅ **Clean output** - Ready-to-use .txt file

## Performance Estimates

| File Size | URLs | Batch Size | Est. Time | Memory |
|-----------|------|------------|-----------|--------|
| 100MB | ~10,000 | 50 | ~15 min | <150MB |
| 500MB | ~50,000 | 50 | ~1.5 hrs | <200MB |
| 1GB | ~100,000 | 100 | ~2 hrs | <250MB |

## Output

The validated redirector list will be saved to:
```
backend/data/<output_name>.txt
```

## Example Output

```
🚀 Large Redirector File Processor
================================================================================
File: /Users/you/redirects.txt
Target URL: https://example.com
Output Name: my-redirectors
Batch Size: 50 concurrent requests
================================================================================

📖 Step 1: Reading and extracting URLs from file...
✅ Extracted 52,431 unique redirector URLs

🧪 Step 2: Validating URLs (batch size: 50)...
   Progress: 52431/52431 (100%) - Valid: 38521, Invalid: 13910 ✓

✅ Validation complete!

📊 Results:
   Total URLs: 52,431
   Valid: 38,521
   Invalid: 13,910
   Success Rate: 73%
   Duration: 5247s

💾 Step 3: Saving valid redirectors...
✅ Saved 38,521 valid redirectors to: backend/data/my-redirectors.txt

================================================================================
✅ PROCESSING COMPLETE!
================================================================================
```

## Batch Size Recommendations

| URLs | Recommended Batch Size | Notes |
|------|----------------------|-------|
| < 10,000 | 20-30 | Conservative |
| 10,000 - 50,000 | 50 | Balanced |
| 50,000 - 100,000 | 50-100 | Aggressive |
| > 100,000 | 50 | More stable |

**Note**: Higher batch sizes = faster processing but more aggressive server load.

## Web UI Limit

The web UI has a **50MB limit**. If you try to process a larger file through the web interface, you'll see:

```json
{
  "success": false,
  "error": "Input text is too large (523MB). For files larger than 50MB, please use the command-line tool: node process_large_redirector.js <file_path> <target_url> <output_name> [batch_size]",
  "sizeInMB": 523,
  "recommendation": "Use the standalone processor: backend/process_large_redirector.js"
}
```

## Troubleshooting

### Out of Memory Error

If you get an out-of-memory error, reduce the batch size:
```bash
node process_large_redirector.js ./file.txt https://site.com output 20
```

### Timeout Errors

If many URLs timeout, they'll be marked as invalid. Increase timeout in code if needed (currently 5 seconds per URL).

### Process Interrupted

The tool saves progress to SQLite. However, resume functionality is not yet implemented. If interrupted, you'll need to restart from the beginning.

## Next Steps

After processing:

1. Your validated redirectors are saved to `backend/data/<output_name>.txt`
2. You can import this file into the web UI via the Redirectors page
3. Or use it directly in your campaigns

## Advanced Usage

### Custom Validation Timeout

Edit `process_large_redirector.js` line 89:
```javascript
timeout: 5000,  // Change to 10000 for 10 second timeout
```

### Filter by Success Rate

If success rate is < 50%, you may want to review your source file quality.

### Parallel Processing Multiple Files

Run multiple instances in separate terminals for different files.

## Support

For issues or questions, check the main documentation or contact support.

# Fix for Exposed API Key

## Issue Identified

GitGuardian has detected an exposed API key in commit `9142dde`:
- File: `index.html`
- Line 3463: `const weatherApiKey = '2512cd4aeac664aaefe7e1338c48b0ba';`
- Type: OpenWeatherMap API Key

## Immediate Actions

1. **Revoke the exposed API key**
   - Log in to your OpenWeatherMap account
   - Regenerate or revoke the exposed API key
   - Create a new API key to use in your local development

2. **Remove the exposed key from GitHub history**
   ```bash
   # Install BFG Repo Cleaner if not already installed
   # On Ubuntu: sudo apt-get install bfg
   # Or download from: https://rtyley.github.io/bfg-repo-cleaner/
   
   # Clone a fresh copy of your repo (mirror)
   git clone --mirror git@github.com:VonHoltenCodes/vonholtencodes-site.git vonholtencodes-site-mirror
   
   # Run BFG to replace the API key
   cd vonholtencodes-site-mirror
   bfg --replace-text ../replacements.txt
   
   # Create replacements.txt with:
   # 2512cd4aeac664aaefe7e1338c48b0ba=YOUR_API_KEY_HERE
   
   # Clean up the repository
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Push the cleaned history
   git push
   ```

3. **Update your local repository**
   ```bash
   # After pushing the cleaned history
   cd /home/traxx/GITHUB/
   mv vonholtencodes-site vonholtencodes-site-backup
   git clone git@github.com:VonHoltenCodes/vonholtencodes-site.git
   
   # Copy your local changes back (except the sensitive files)
   cp -r vonholtencodes-site-backup/.local_backups vonholtencodes-site/
   ```

## Prevent Future Exposures

1. **We've already updated the redaction script**
   - Added specific pattern for the OpenWeatherMap API key
   - The script now properly redacts the API key

2. **Always use the redaction workflow**
   - Run `./github_prep.sh` before committing changes
   - Push to GitHub with redacted files
   - Run `./github_restore.sh` to restore your working files

3. **Consider these additional precautions**
   - Add environment variables for sensitive information
   - Use a .env file (added to .gitignore) for local development
   - Consider using GitHub Secrets for any CI/CD processes

## Testing Your Redaction

Before pushing to GitHub, always test that your API keys are properly redacted:

```bash
# Run the redaction script
./redact_files.sh

# Check for any API keys in the redacted files
grep -r "2512cd4" --include="*.github" .
grep -r "apiKey" --include="*.github" .
```

## Important Note

Changing Git history affects all collaborators. Each collaborator will need to re-clone the repository after the history rewrite.
# GitHub Workflow Instructions

This document outlines the process for safely pushing code to GitHub while protecting sensitive information.

## Preparing Files for GitHub

Before pushing to GitHub, we need to replace sensitive information (passwords, API keys, etc.) with placeholder values. The following scripts help automate this process:

### 1. Create Redacted Versions

```bash
./redact_files.sh
```

This creates GitHub-safe versions of sensitive files with `.github` extensions:
- `admin.php.github` - Admin panel with redacted credentials
- `.htpasswd.github` - Authentication file with redacted credentials
- `index.html.github` - Main site with redacted API keys
- `deploy.sh.github` - Deployment script with notes about environment-specific settings

### 2. Prepare Repository for GitHub Push

```bash
./github_prep.sh
```

This script:
- Creates backups of your original files in `.local_backups/`
- Replaces the original files with their redacted versions
- Makes the repository ready for GitHub push

### 3. Commit and Push to GitHub

```bash
git add .
git commit -m "Update site with PHP admin panel and security features"
git push origin main
```

### 4. Restore Original Files

After pushing to GitHub, restore your original files with:

```bash
./github_restore.sh
```

This copies your original files back from the `.local_backups/` directory.

## Important Security Notes

1. The `.local_backups/` directory is in `.gitignore` to prevent accidentally pushing sensitive data
2. Always run the `github_prep.sh` script before pushing to GitHub
3. Always run the `github_restore.sh` script after pushing to restore your working files
4. Never commit files containing real credentials, API keys, or passwords
5. The `.gitignore` file is configured to prevent accidental commits of sensitive files

## Checking for Sensitive Data

Before pushing to GitHub, always verify that sensitive data has been properly redacted:

```bash
# After running github_prep.sh, check for common patterns:
grep -r "apiKey" --include="*.html" .
grep -r "password" --include="*.php" .
grep -r "key" --include="*.js" .
grep -r "secret" --include="*.php" .
grep -r "token" --include="*.js" .
```

If any sensitive data is found in the output, fix your redaction scripts and try again.

## Files with Sensitive Information

These files contain sensitive information and are automatically redacted:

- `admin.php` - Contains admin username/password
- `.htpasswd` - Contains authentication credentials
- `index.html` - Contains API keys
- `deploy.sh` - Contains server paths and commands

## Deployment

To deploy the website to the server:

1. Run the deploy script:
   ```bash
   ./deploy.sh
   ```

2. Enter your sudo password once when prompted

The deploy script will:
- Ask for your password only once and cache it for the entire script
- Copy all necessary files to the web server
- Set appropriate permissions
- Install PHP and Apache modules if needed
- Provide clear feedback on each step of the process

## Regular Workflow Summary

1. Make your changes to the site
2. Run `./github_prep.sh` to prepare for GitHub
3. Commit and push your changes
4. Run `./github_restore.sh` to restore your working files
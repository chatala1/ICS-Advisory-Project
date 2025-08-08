# GitHub Pages Setup

This repository is configured with GitHub Pages to provide a live website at:
**https://chatala1.github.io/ICS-Advisory-Project**

## How it works

1. **Jekyll Configuration**: The `_config.yml` file configures Jekyll to build the site
2. **GitHub Actions**: The `.github/workflows/pages.yml` workflow automatically builds and deploys the site when changes are pushed to the main branch
3. **Website Files**:
   - `index.html` - Main website homepage
   - `style.css` - Website styling
   - `ICS-CERT_ADV/index.md` - Directory listing page for CSV files

## Features

The GitHub Pages site provides:

- **Professional presentation** of the ICS Advisory Project
- **Direct download links** for all CSV data files
- **Community links** to Discord, dashboard, and tools
- **Responsive design** that works on desktop and mobile
- **Automatic deployment** when the repository is updated

## Enabling GitHub Pages

To enable GitHub Pages for this repository:

1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions" 
3. The site will automatically deploy when changes are pushed to main

## Local Development

To test the site locally:

```bash
# Install Jekyll (if not already installed)
gem install jekyll bundler

# Serve the site locally
jekyll serve

# Visit http://localhost:4000
```

## CSV File Access

All CSV files in the `ICS-CERT_ADV/` directory are automatically included and accessible via:
- Direct download buttons on the homepage
- Directory listing at `/ICS-CERT_ADV/`
- Individual file URLs like `/ICS-CERT_ADV/CISA_ICS_ADV_Master.csv`
# Build the Astro site
build:
    npm run build

# Copy dist to docs and add .nojekyll for GitHub Pages
publish: build
    rm -rf docs
    cp -r dist docs
    touch docs/.nojekyll
    @echo "Site ready in /docs - commit and push to deploy"

# Clean build artifacts
clean:
    rm -rf dist docs

# Dev server
dev:
    npm run dev

# Build and preview locally
preview: build
    npm run preview
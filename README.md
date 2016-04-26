# lasape
front-end

## Building

### Pre-requisites
You'll need to make sure Node, Ruby, and bundler are installed:

```bash
// On OSX
brew install node
sudo gem install bundler
```

### Compiling
```bash
# Installs the dependencies (if needed) and builds the email templates once.
# The resulting HTML files will be in dist/email, ready to paste into Mandrill
npm run build

# Watches for changes. This stuff will also output to dist/email.
npm run watch

# Publish the template with the given name to Mandrill
npm run publish <template name>
```

## Tools

Lasape utilizes a combination of technologies for eventual output.

### Grunt

Grunt is the central command for all tooling. Running grunt through bundle ensures correct ruby packages are in use.

### Bower

Bower is used for most of the dependencies such as Bootstrap. All libraries should be installed through bower and persisted to bower.json. The dependencies are installed to `src/lib` as dictated by .bowerrc.

### NPM

NPM manages dependencies for running all `grunt` tasks. Packages are persisted through package.json.

### Gemfile

The Gemfile persists all Ruby dependencies.

### Jekyll

Jekyll is used to create the html emails. The src files are located in `/src` and are generated on-the-fly.

## SASS

We also use [Compass](http://compass-style.org/) for some great helper functions.

## HTML Emails

Emails are generated through Jekyll and are run through an inliner that will ensure proper rendering. Source HTML is at `/src/email`. Source CSS comes from `/src/scss`.
# lasape
[![Circle CI](https://circleci.com/gh/opsee/lasape.svg?style=shield&circle-token=efe5bacba586a859d12fed4aad1b895bfe9af57f)](https://circleci.com/gh/opsee/lasape)

`<ferengi voice> emails`

## Building

### Pre-requisites
You'll need to make sure Node, Ruby, and bundler are installed:

```bash
// On OSX
brew install node
sudo gem install bundler
```

### Making changes
Here's how you can run lasape locally:

```bash
# Installs the dependencies (if needed) and builds the email templates once.
# The resulting HTML files will be in dist/email, ready to paste into Mandrill
npm run build

# Watches for changes. This stuff will also output to dist/email.
npm run watch
```

### Adding email templates
Create a new template under [`src/email`](https://github.com/opsee/lasape/tree/master/src/email), and add an email subject in [`config/default.json`](https://github.com/opsee/lasape/blob/master/config/default.json).

### Publishing email templates
All email templates are automatically published to Mandrill when the Lasape `master` branch is updated. You can view the current templates at https://mandrillapp.com/templates.

Since the templates in Mandrill are overwritten on every `master` deploy, avoid making any changes in the Mandrill UI that you want should be copied into Lasape.

#### Publishing from your local machine
If you need to, you can publish templates from your local machine to Mandrill. First, get a copy of the Mandrill API key and either save it as an environment variable named `MANDRILL_API_KEY`, or create a `config/local.json` file that looks like this:

```json
{
  "mandrill": {
    "api_key": "MANDRILL-KEY-GOES-HERE"
  }
}
```

Next, build the emails with `npm run build`. Finally, publish templates with any of the following commands:
```bash
# Publish all templates to Mandrill
npm run publish

# Publish the template with the given name to Mandrill, 
# where "some-template-name" is the name of the HTML file under dist/
npm run publish -t some-template-name
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

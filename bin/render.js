/**
 * A script to shove variables into handlebar templates & output the
 * final email HTML, which can then be previewed in a browser.
 *
 * Usage:
 * ------
 * Render a template without any variables:
 *    $ node render.js some-template
 *
 * Render a template, passing data as a JSON string:
 *    $ node render.js some-template --json '{"firstName": "Bart", "lastName": "Simpson"}'
 *
 * Render a template, loading JSON data from the file at the given path:
 *    $ node render.js some-template --jsonFile ./test-data.json
 *
 *
 * Using with npm
 * ---------------
 * If you're running this with `npm run render`, you can pass in the template
 * name and any other arguments prepended with `--`. For example:
 *    $ npm run render -- beta-approval --json '{"firstName": "Bart", "lastName": "Simpson"}'
 *
 * A note about Mandrill
 * ---------------------
 * The Mandrill API offers an API endpoint for rendering templates
 * (see https://mandrillapp.com/api/docs/templates.nodejs.html#method=render),
 * however the API only supports the MailChimp merge language, whereas
 * Lasape uses Handlebars. See https://github.com/rschreijer/lutung/issues/65.
 *
 */
const _ = require('lodash');
const fs = require('fs');
const handlebars = require('handlebars');
const parseArgs = require('minimist');
const path = require('path');

handlebars.registerHelper('url', str => str);

function parseData(argv) {
  if (_.has(argv, 'jsonFile')) {
    const filePath = _.get(argv, 'jsonFile');
    const fileData = fs.readFileSync(filePath);
    return JSON.parse(fileData);
  } else if (_.has(argv, 'json')) {
    return JSON.parse(_.get(argv, 'json'));
  } else {
    return {};
  }
}

function render() {
  const argv = parseArgs(process.argv.slice(2));
  const templateName = _.first(argv._);

  if (!templateName) {
    throw new Error('Must specify template name.');
  }

  const templateFilename = `${templateName}.html`;
  const templatePath = path.resolve(__dirname, '..', 'dist', 'email', templateFilename);
  const templateSource = fs.readFileSync(templatePath, 'utf8');

  const template = handlebars.compile(templateSource);
  const data = parseData(argv);
  const result = template(data);
  console.log(result);
}

// Do the thing!
render();
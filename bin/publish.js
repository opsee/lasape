const _ = require('lodash');
const config = require('config');
const fs = require('fs');
const mandrill = require('mandrill-api/mandrill');
const parseArgs = require('minimist');
const path = require('path');

function printUsage() {
  console.log(`
    Add and update Lasape templates in Mandrill.

    Usage:
    \tnode publish.js <template name> [opts]

    Options:
    \t--draft\tPublish the template as a draft
  `);
}

function addOrUpdate(params) {
  const mandrillClient = new mandrill.Mandrill(config.mandrill.api_key);
  return new Promise((resolve, reject) => {
    mandrillClient.templates.update(params, resolve, error => {
      if (error.name === 'Unknown_Template') {
        mandrillClient.templates.add(params, resolve, reject);
      } else {
        reject(error);
      }
    });
  });
}

const argv = parseArgs(process.argv.slice(2));
const templateName = _.first(_.get(argv, '_'));

if (typeof templateName !== 'string') {
  printUsage();
  process.exit(1);
}

const templatePath = path.resolve(path.join(__dirname, '..', 'dist', 'email', `${templateName}.html`));
const templateHTML = fs.readFileSync(templatePath, 'utf8');
const templateSubject = config.get(`subjects.${templateName}`);

addOrUpdate({
  name: templateName,
  code: templateHTML,
  from_email: config.mandrill.from_email,
  from_name: config.mandrill.from_name,
  subject: templateSubject,
  publish: !_.get(argv, 'draft', false)
}).then(response => {
  console.log(`Template "${templateName}" was updated 😎`)
  console.log(`Check it out: https://mandrillapp.com/templates/code?id=${response.slug}`)
}).catch(err => {
  console.error(`An error occurred and ${templateName} was not updated!`);
  console.error(err);
});

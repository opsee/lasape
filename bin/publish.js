const _ = require('lodash');
const config = require('config');
const fs = require('fs');
const mandrill = require('mandrill-api/mandrill');
const parseArgs = require('minimist');
const path = require('path');

if (!config.mandrill.api_key) {
  throw new Error('Missing Mandrill API key in config! Make sure to add it to your config/local.json or save it as an environment variable named MANDRILL_API KEY.');
}

function printUsage() {
  console.log(`
    Add and update Lasape templates in Mandrill. By default, publishes all
    templates under dist/email.

    Usage:
    \t node publish.js [opts]

    Options:
    \t-t TEMPLATE_NAME\tPublish a single template (by name)
    \t--draft\t\t\tPublish the template as a draft
  `);
}

function addOrUpdate(params) {
  const mandrillClient = new mandrill.Mandrill(config.mandrill.api_key);
  return new Promise((resolve, reject) => {
    mandrillClient.templates.update(params, resolve, error => {
      console.log('error', error);
      if (error.name === 'Unknown_Template') {
        mandrillClient.templates.add(params, resolve, reject);
      } else {
        reject(error);
      }
    });
  });
}

function uploadTemplate(templateName) {
  console.log(`Uploading ${templateName}`);
  const templatePath = path.resolve(path.join(__dirname, '..', 'dist', 'email', `${templateName}.html`));
  const templateHTML = fs.readFileSync(templatePath, 'utf8');
  const templateSubject = config.get(`subjects.${templateName}`);

  return addOrUpdate({
    name: `TEST-${templateName}`,
    code: templateHTML,
    from_email: config.mandrill.from_email,
    from_name: config.mandrill.from_name,
    subject: templateSubject,
    publish: !_.get(argv, 'draft', false)
  });
}

function uploadTemplates(templateNames) {
  console.log(`Uploading ${templateNames.length} email template(s) to Mandrill...\n`);
  const promises = _.map(templateNames, templateName => uploadTemplate(templateName));

  Promise.all(promises)
    .then(responses => {
      console.log(`\nUploaded ${templateNames.length} email template(s) to Mandrill. 😎`);
      console.log('You can view them at https://mandrillapp.com/templates');
    }, err => {
      console.log('An error occurred!');
      console.error(err);
    });
}

const argv = parseArgs(process.argv.slice(2));
const template = _.get(argv, 't');

if (_.has(argv, 'help')) {
  printUsage();
}
else if (template) {
  uploadTemplates([template]);
}

else {
  const templateFolder = path.resolve(path.join(__dirname, '..', 'dist', 'email'));
  fs.readdir(templateFolder, (err, files) => {
    if (err) {
      console.error(err);
    }

    const templateNames = _.map(files, filename => /^(\S+)\.html$/.exec(filename)[1]);
    uploadTemplates(templateNames);
  });
}

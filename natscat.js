#!/usr/bin/env node

const fs = require('fs');
const NATS = require('nats');
const chalk = require('chalk');
const jsyaml = require('js-yaml');
const moment = require('moment');

const yargs = require('yargs')
  .scriptName('natscat')
  .usage('natscat [messages...]')
  .option('--nats', { alias: 'n', description: 'nats url' })
  .option('--subject', { alias: 'j', description: 'subjects' })
  .option('--subscribe', { alias: 's', description: 'subscribe', boolean: true })
  .option('--publish', { alias: 'p', description: 'publish', boolean: true })
  .option('--request', { alias: 'r', description: 'request', boolean: true })
  .option('--file', { alias: 'f', description: 'input json or yaml file' })
  .help()

const argv = yargs.argv;
const subjects = typeof argv.subject == 'string' ? [argv.subject] : argv.subject;

const load = () => jsyaml.loadAll(fs.readFileSync(argv.file), 'utf8').map(p => JSON.stringify(p));
const messages = argv.file ? load() : argv._;

const send = chalk.blue('===>');
const recv = chalk.green('<===');

const time = () => moment().format('YYYY-MM-DD HH:mm:ss.SSS');
const log = message => console.log(
  chalk.gray(time()), '    ', chalk.gray(message)
);

const logSend = (message, to) => console.log(
  chalk.gray(time()), send, chalk.yellow(message), chalk.bgBlue(chalk.black(` ${to} `))
);

const logRecv = (message, from) => console.log(
  chalk.gray(time()), recv, chalk.yellow(message), chalk.bgGreen(chalk.black(` ${from} `))
);

const connect = () => {
  const url = argv.nats ||
    process.env.NATS ||
    'localhost:4222';
  log(`connecting to nats ${url}`)
  return NATS.connect(url);
};

async function run() {
  if (argv.publish) {
    const nats = connect();

    for (const message of messages) {
      for (const subject of subjects) {
        await new Promise(resolve =>
          nats.publish(subject, message, () => resolve()));
        logSend(message, subject);
      }
    }

    process.exit(0);
  } else if (argv.request) {
    const nats = connect();

    for (const subject of subjects) {
      for (const message of messages) {
        logSend(message, subject);
        const reply = await new Promise(resolve =>
          nats.request(subject, message, reply => resolve(reply)));
        logRecv(reply, subject);
      }
    }

    process.exit(0);
  } else if (argv.subscribe) {
    const nats = connect();

    for (const subject of subjects) {
      nats.subscribe(subject, async (received, reply, subject, n) => {
        logRecv(received, subject);
        for (const message of messages) {
          await new Promise(resolve =>
            nats.publish(reply, message, () => resolve()));
          logSend(message, reply)
        }
      });
      log(`subscribed to ${subject}`);
    }
  } else {
    yargs.showHelp();
  }
}

run();

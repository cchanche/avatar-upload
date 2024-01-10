'use strict';

var fs$1 = require('fs');
var path$1 = require('path');
var require$$2 = require('os');
var require$$3 = require('crypto');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs$1);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path$1);

/**
 * Prints console messages with prefix
 */
class Logger {
    scope;
    constructor(scope) {
        this.scope = scope || 'nodemon';
    }
    log = (...data) => 
    // eslint-disable-next-line no-console
    console.log(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, `\x1b[1m\x1b[36m[${this.scope}]\x1b[0m `, ...data);
    error = (...data) => console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, `\x1b[1m\x1b[36m[${this.scope}]\x1b[0m \x1b[31m`, ...data, '\x1b[0m');
    warn = (...data) => 
    // eslint-disable-next-line no-console
    console.warn(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, `\x1b[1m\x1b[36m[${this.scope}]\x1b[0m \x1b[33m`, ...data, '\x1b[0m');
}

var main$1 = {exports: {}};

var name = "dotenv";
var version$1 = "16.3.1";
var description = "Loads environment variables from .env file";
var main = "lib/main.js";
var types = "lib/main.d.ts";
var exports$1 = {
	".": {
		types: "./lib/main.d.ts",
		require: "./lib/main.js",
		"default": "./lib/main.js"
	},
	"./config": "./config.js",
	"./config.js": "./config.js",
	"./lib/env-options": "./lib/env-options.js",
	"./lib/env-options.js": "./lib/env-options.js",
	"./lib/cli-options": "./lib/cli-options.js",
	"./lib/cli-options.js": "./lib/cli-options.js",
	"./package.json": "./package.json"
};
var scripts = {
	"dts-check": "tsc --project tests/types/tsconfig.json",
	lint: "standard",
	"lint-readme": "standard-markdown",
	pretest: "npm run lint && npm run dts-check",
	test: "tap tests/*.js --100 -Rspec",
	prerelease: "npm test",
	release: "standard-version"
};
var repository = {
	type: "git",
	url: "git://github.com/motdotla/dotenv.git"
};
var funding = "https://github.com/motdotla/dotenv?sponsor=1";
var keywords = [
	"dotenv",
	"env",
	".env",
	"environment",
	"variables",
	"config",
	"settings"
];
var readmeFilename = "README.md";
var license = "BSD-2-Clause";
var devDependencies = {
	"@definitelytyped/dtslint": "^0.0.133",
	"@types/node": "^18.11.3",
	decache: "^4.6.1",
	sinon: "^14.0.1",
	standard: "^17.0.0",
	"standard-markdown": "^7.1.0",
	"standard-version": "^9.5.0",
	tap: "^16.3.0",
	tar: "^6.1.11",
	typescript: "^4.8.4"
};
var engines = {
	node: ">=12"
};
var browser = {
	fs: false
};
var require$$4 = {
	name: name,
	version: version$1,
	description: description,
	main: main,
	types: types,
	exports: exports$1,
	scripts: scripts,
	repository: repository,
	funding: funding,
	keywords: keywords,
	readmeFilename: readmeFilename,
	license: license,
	devDependencies: devDependencies,
	engines: engines,
	browser: browser
};

const fs = fs$1;
const path = path$1;
const os = require$$2;
const crypto = require$$3;
const packageJson = require$$4;

const version = packageJson.version;

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

// Parse src into an Object
function parse (src) {
  const obj = {};

  // Convert buffer to string
  let lines = src.toString();

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n');

  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];

    // Default undefined or null to empty string
    let value = (match[2] || '');

    // Remove whitespace
    value = value.trim();

    // Check if double quoted
    const maybeQuote = value[0];

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2');

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n');
      value = value.replace(/\\r/g, '\r');
    }

    // Add to object
    obj[key] = value;
  }

  return obj
}

function _parseVault (options) {
  const vaultPath = _vaultPath(options);

  // Parse .env.vault
  const result = DotenvModule.configDotenv({ path: vaultPath });
  if (!result.parsed) {
    throw new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`)
  }

  // handle scenario for comma separated keys - for use with key rotation
  // example: DOTENV_KEY="dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenv.org/vault/.env.vault?environment=prod"
  const keys = _dotenvKey(options).split(',');
  const length = keys.length;

  let decrypted;
  for (let i = 0; i < length; i++) {
    try {
      // Get full key
      const key = keys[i].trim();

      // Get instructions for decrypt
      const attrs = _instructions(result, key);

      // Decrypt
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);

      break
    } catch (error) {
      // last key
      if (i + 1 >= length) {
        throw error
      }
      // try next key
    }
  }

  // Parse decrypted .env string
  return DotenvModule.parse(decrypted)
}

function _log (message) {
  console.log(`[dotenv@${version}][INFO] ${message}`);
}

function _warn (message) {
  console.log(`[dotenv@${version}][WARN] ${message}`);
}

function _debug (message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`);
}

function _dotenvKey (options) {
  // prioritize developer directly setting options.DOTENV_KEY
  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
    return options.DOTENV_KEY
  }

  // secondary infra already contains a DOTENV_KEY environment variable
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY
  }

  // fallback to empty string
  return ''
}

function _instructions (result, dotenvKey) {
  // Parse DOTENV_KEY. Format is a URI
  let uri;
  try {
    uri = new URL(dotenvKey);
  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      throw new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=development')
    }

    throw error
  }

  // Get decrypt key
  const key = uri.password;
  if (!key) {
    throw new Error('INVALID_DOTENV_KEY: Missing key part')
  }

  // Get environment
  const environment = uri.searchParams.get('environment');
  if (!environment) {
    throw new Error('INVALID_DOTENV_KEY: Missing environment part')
  }

  // Get ciphertext payload
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
  const ciphertext = result.parsed[environmentKey]; // DOTENV_VAULT_PRODUCTION
  if (!ciphertext) {
    throw new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`)
  }

  return { ciphertext, key }
}

function _vaultPath (options) {
  let dotenvPath = path.resolve(process.cwd(), '.env');

  if (options && options.path && options.path.length > 0) {
    dotenvPath = options.path;
  }

  // Locate .env.vault
  return dotenvPath.endsWith('.vault') ? dotenvPath : `${dotenvPath}.vault`
}

function _resolveHome (envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

function _configVault (options) {
  _log('Loading env from encrypted .env.vault');

  const parsed = DotenvModule._parseVault(options);

  let processEnv = process.env;
  if (options && options.processEnv != null) {
    processEnv = options.processEnv;
  }

  DotenvModule.populate(processEnv, parsed, options);

  return { parsed }
}

function configDotenv (options) {
  let dotenvPath = path.resolve(process.cwd(), '.env');
  let encoding = 'utf8';
  const debug = Boolean(options && options.debug);

  if (options) {
    if (options.path != null) {
      dotenvPath = _resolveHome(options.path);
    }
    if (options.encoding != null) {
      encoding = options.encoding;
    }
  }

  try {
    // Specifying an encoding returns a string instead of a buffer
    const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }));

    let processEnv = process.env;
    if (options && options.processEnv != null) {
      processEnv = options.processEnv;
    }

    DotenvModule.populate(processEnv, parsed, options);

    return { parsed }
  } catch (e) {
    if (debug) {
      _debug(`Failed to load ${dotenvPath} ${e.message}`);
    }

    return { error: e }
  }
}

// Populates process.env from .env file
function config (options) {
  const vaultPath = _vaultPath(options);

  // fallback to original dotenv if DOTENV_KEY is not set
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options)
  }

  // dotenvKey exists but .env.vault file does not exist
  if (!fs.existsSync(vaultPath)) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);

    return DotenvModule.configDotenv(options)
  }

  return DotenvModule._configVault(options)
}

function decrypt (encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), 'hex');
  let ciphertext = Buffer.from(encrypted, 'base64');

  const nonce = ciphertext.slice(0, 12);
  const authTag = ciphertext.slice(-16);
  ciphertext = ciphertext.slice(12, -16);

  try {
    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    aesgcm.setAuthTag(authTag);
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`
  } catch (error) {
    const isRange = error instanceof RangeError;
    const invalidKeyLength = error.message === 'Invalid key length';
    const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data';

    if (isRange || invalidKeyLength) {
      const msg = 'INVALID_DOTENV_KEY: It must be 64 characters long (or more)';
      throw new Error(msg)
    } else if (decryptionFailed) {
      const msg = 'DECRYPTION_FAILED: Please check your DOTENV_KEY';
      throw new Error(msg)
    } else {
      console.error('Error: ', error.code);
      console.error('Error: ', error.message);
      throw error
    }
  }
}

// Populate process.env with parsed values
function populate (processEnv, parsed, options = {}) {
  const debug = Boolean(options && options.debug);
  const override = Boolean(options && options.override);

  if (typeof parsed !== 'object') {
    throw new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate')
  }

  // Set process.env
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key];
      }

      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`);
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`);
        }
      }
    } else {
      processEnv[key] = parsed[key];
    }
  }
}

const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
};

main$1.exports.configDotenv = DotenvModule.configDotenv;
main$1.exports._configVault = DotenvModule._configVault;
main$1.exports._parseVault = DotenvModule._parseVault;
var config_1 = main$1.exports.config = DotenvModule.config;
main$1.exports.decrypt = DotenvModule.decrypt;
main$1.exports.parse = DotenvModule.parse;
main$1.exports.populate = DotenvModule.populate;

main$1.exports = DotenvModule;

const getIOFolders = (options) => {
    const { logger } = options || {};
    const IMG_INPUT_FOLDER = options?.folderName?.input || 'input';
    const IMG_INPUT_FOLDER_PATH = path__namespace.resolve(IMG_INPUT_FOLDER);
    const IMG_OUTPUT_FOLDER = options?.folderName?.output || 'output';
    const IMG_OUTPUT_FOLDER_PATH = path__namespace.resolve(IMG_OUTPUT_FOLDER);
    // Check input & output folders
    if (!fs__namespace.existsSync(IMG_INPUT_FOLDER_PATH)) {
        logger?.log('Source folder does not exists. Creating...');
        fs__namespace.mkdirSync(IMG_INPUT_FOLDER_PATH);
        logger?.log('Created folder ' + IMG_INPUT_FOLDER_PATH);
        logger?.warn(`Please copy your input files to ${IMG_INPUT_FOLDER_PATH}`);
        process.exit(1);
    }
    else {
        logger?.log('Input folder is at ' + IMG_INPUT_FOLDER_PATH);
    }
    if (!fs__namespace.existsSync(IMG_OUTPUT_FOLDER_PATH)) {
        logger?.log('Output folder does not exists. Creating...');
        fs__namespace.mkdirSync(IMG_OUTPUT_FOLDER_PATH);
        logger?.log('Created folder ' + IMG_OUTPUT_FOLDER_PATH);
    }
    else {
        logger?.log('Output folder is at ' + IMG_OUTPUT_FOLDER_PATH);
    }
    return { IMG_INPUT_FOLDER_PATH, IMG_OUTPUT_FOLDER_PATH };
};

// Parse .env into process.env
config_1();
const handler = (async () => {
    const logger = new Logger('image-upload');
    const { IMG_INPUT_FOLDER_PATH, IMG_OUTPUT_FOLDER_PATH: _ } = getIOFolders({
        logger,
    });
    logger.log('Reading image entries...');
    const entries = fs__namespace.readdirSync(IMG_INPUT_FOLDER_PATH, {
        withFileTypes: true,
    });
    const images = entries.filter((e) => e.isFile());
    logger.log('Found images :');
    for (const img of images) {
        logger.log(`  ${img.name}`);
    }
    for (const dirent of images) {
        logger.log(`Process : ${dirent.name}...`);
        // TODO
    }
})();

exports.handler = handler;

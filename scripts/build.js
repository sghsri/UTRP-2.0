// Do this as the first thing so that any code reading it knows the right env.
var args = process.argv.slice(2);
const env_arg = args.length ? args[0] : "-d";

const environment = env_arg === "-p" ? "production" : "development";
const IS_PRODUCTION_ENV = environment === "production";

process.env.BABEL_ENV = environment;
process.env.NODE_ENV = environment;
process.env.FORCE_COLOR = 1;
// Ensure environment variables are read.
require("../config/env");

const path = require("path");
const chalk = require("react-dev-utils/chalk");
const fs = require("fs-extra");
const webpack = require("webpack");
const configFactory = require("../config/webpack.config");
const paths = require("../config/paths");
const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles");
const formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
const FileSizeReporter = require("react-dev-utils/FileSizeReporter");
const printBuildError = require("react-dev-utils/printBuildError");
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const { checkBrowsers } = require("react-dev-utils/browsersHelper");
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;
const isInteractive = process.stdout.isTTY;

// Makes the script crash on unhandled rejections instead of silently ignoring them.
process.on("unhandledRejection", err => {
    throw err;
});

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

// Generate configuration
const webpackConfig = configFactory(environment);
const metaBuildConfig = require("./metaBuildConfig.json");
const EXTENSION_MANIFEST = require("../public/manifest.json");
// const EXTENSION_CONFIG = require("../src/config");

// require that you explicitly set browsers and do not fall back to browserslist defaults.
checkBrowsers(paths.appPath, isInteractive)
    .then(() => {
        // let's do some extra checks if this is supposed to be a production build;
        if (IS_PRODUCTION_ENV) {
            const branchName = require("current-git-branch")();
            if (!metaBuildConfig.allowedProductionBuildBranches.includes(branchName)) {
                console.log(chalk.red("Production builds can only be created on the 'master' branch.\n"));
                console.log(chalk.bold.red(`You are on ${branchName}\n`));
                process.exit(1);
            }
        }
    })
    .then(() => {
        // Next, read the current file sizes in build directory (This lets us display how much they changed later.)
        return measureFileSizesBeforeBuild(paths.appBuild);
    })
    .then(previousFileSizes => {
        // Remove all files in directory, merge with the public folder, and then start the webpack build
        fs.emptyDirSync(paths.appBuild);
        copyPublicFolder();
        return build(previousFileSizes);
    })
    .then(
        ({ stats, previousFileSizes, warnings }) => {
            console.log(chalk.bold.green("Compiled successfully " + chalk.bold.yellow(`with ${warnings.length} Warnings.`)));
            if (IS_PRODUCTION_ENV) {
                console.log("File sizes after gzip:\n");
                printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
                console.log();
            }
        },
        err => {
            if (process.env.TSC_COMPILE_ON_ERROR === "true") {
                console.log(chalk.yellow("Compiled with the following type errors:\n"));
                printBuildError(err);
            } else {
                console.log(chalk.red("Failed to compile.\n"));
                printBuildError(err);
                process.exit(1);
            }
        }
    )
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });

// Create the build and print the deployment instructions.
function build(previousFileSizes) {
    console.log(chalk.bgHex("#FF9800").rgb(255, 255, 255)(`Creating UT Registration Plus v${EXTENSION_MANIFEST.version} ${environment.toUpperCase()} build... \n`));
    const compiler = webpack(webpackConfig);
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            let messages;
            if (err) {
                if (!err.message) {
                    return reject(err);
                }
                // Add additional information for postcss errors
                if (Object.prototype.hasOwnProperty.call(err, "postcssNode")) {
                    err.message += `\nCompileError: Begins at CSS selector ${err["postcssNode"].selector}`;
                }
                messages = formatWebpackMessages({ errors: [err.message], warnings: [] });
            } else {
                messages = formatWebpackMessages(stats.toJson({ all: false, warnings: true, errors: true }));
            }
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative // of the same problem,
                if (messages.errors.length > 1) {
                    messages.errors.length = 1;
                }
                return reject(new Error(messages.errors.join("\n\n")));
            }
            if (process.env.CI && (typeof process.env.CI !== "string" || process.env.CI.toLowerCase() !== "false") && messages.warnings.length) {
                console.log(chalk.yellow(`\nTreating warnings as errors because process.env.CI = true.\nMost CI servers set it automatically.\n`));
                return reject(new Error(messages.warnings.join("\n\n")));
            }
            return resolve({
                stats,
                previousFileSizes,
                warnings: messages.warnings,
            });
        });
    });
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}

/* eslint no-console:0 */
import webpack from "webpack";
import webpackConfig from "./webpack.config.prod";
import chalk from "chalk";

process.env.NODE_ENV = "production";
console.log(chalk.blue("Generating minified bundle for production."));
webpack(webpackConfig).run((err, stats) => {
    if (err) {
        console.log(chalk.red(err));
        return 1;
    }

    const jsonStats = stats.toJson();

    if (jsonStats.hasErrors)
        return jsonStats.errors.map(er => console.log(chalk.red(er)));

    if (jsonStats.hasWarnings) {
        console.log(chalk.yellow("Webpack gave the following warnings:"));
        jsonStats.warnings.map(w => console.log(chalk.yellow(w)));
    }

    console.log(`Webpack stats: ${stats}`);
    console.log(chalk.green("Successfully built for production and written to /dist"));

    return 0;
});

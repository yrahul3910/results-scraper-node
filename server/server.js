// Module imports
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import chalk from "chalk";
import helmet from "helmet";
import path from "path";
import open from "open";
import { Promise } from "es6-promise";
import { getResult, getStudentResult, updateReval } from "./utils";

// Webpack configuration
import webpack from "webpack";

let webpackConfigFile = {
    "development": "../webpack.config",
    "production": "../webpack.config.prod"
};
let config = require(webpackConfigFile[process.argv[2]]).default;

// Express setup
const port = 8000;
const app = express();
const compiler = webpack(config);
dotenv.config();

// Middleware setup
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser({ extended: true }));

console.log(chalk.cyan("Starting server in " + process.argv[2] + " mode.")); // eslint-disable-line no-console

if (process.argv[2] == "production")
    app.use(express.static("dist"));
app.use(express.static(__dirname + "/public"));

if (process.argv[2] == "development")
    app.use(require("webpack-dev-middleware")(compiler, {
        noInfo: true,
        publicPath: config.output.publicPath
    }));

// Request handling begins here
app.get("/*", (req, res) => {
    if (process.argv[2] == "development")
        res.sendFile(path.join(__dirname, "../src/index.html"));
    else
        res.sendFile(path.join(__dirname, "../dist/index.html"));
});

/**
 * Individual results
 * Request body parameters:
 *  {number} startUSN -- The usn to get results for.
 *  {number} year -- The year in the usn.
 *  {string} department -- The department code.
 *  {number} semester -- The semester to scrape results for.
 */
app.post("/api/Results/Individual", (req, res) => {
    let { startUSN, year, department, semester } = req.body;

    getResult(startUSN.toString(), year.toString(), department.toLowerCase(),
        semester).then((result) => {
            
        if (result.gpa == 0 || result.error) {
            res.status(400);
            res.end();
            return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
    });
});

/**
 * Student-wise results
 * Request body parameters:
 *  {number} usn -- The usn to get results for.
 *  {number} year -- The year in the usn.
 *  {string} department -- The department code.
 */
app.post("/api/Results/Student", async (req, res) => {
    let { usn, year, department } = req.body;

    let result = await getStudentResult(usn.toString(), year.toString(), department.toLowerCase());
    if (result.error) {
        res.status(400);
        res.end();
        return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
});

/**
 * Batch results
 * Request body parameters:
 *  {number} startUSN -- The starting usn to get results for.
 *  {number} endUSN -- The ending usn (inclusive) to get results for.
 *  {number} year -- The year in the usn.
 *  {string} department -- The department code.
 *  {number} semester -- The semester to scrape results for.
 */
app.post("/api/Results/Batch", (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });

    let start = req.body.startUSN;
    let end = req.body.endUSN;
    let { year, department, semester } = req.body;
    let failed = [];

    let promises = [];
    for (let i = start; i <= end; ++i) {
        promises.push(getResult(i.toString().padStart(5 - department.length, "0"),
            year.toString(), department.toLowerCase(), semester));
    }
    Promise.all(promises)
        .then(results => {
            // If some error occurred, gpa = 0.
            failed = results.filter(val => {
                return !(val.gpa) || val.error;
            }).map(val => Number.parseInt(val.usn.substr(val.usn.length - 3)));

            results = results.filter(val => {
                return val.gpa && !val.error;
            });

            let finalResult = {
                results,
                failedResults: failed
            };

            res.end(JSON.stringify(finalResult));
        });
});

/**
 * Update database with revaluation results
 * Request body parameters:
 *  {number} startUSN -- The starting usn to get results for.
 *  {number} endUSN -- The ending usn (inclusive) to get results for.
 *  {number} year -- The year in the usn.
 *  {string} department -- The department code.
 *  {number} semester -- The semester to scrape results for.
 */
app.post("/api/Results/RevalUpdate", (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    let { startUSN, endUSN, semester, year, department } = req.body;

    let promises = [];
    for (let i = startUSN; i <= endUSN; ++i) {
        promises.push(updateReval(i.toString().padStart(5 - department.length, "0"),
            year.toString(), department.toLowerCase(), semester.toString()));
    }

    Promise.all(promises).then(values => {
        let result = {
            success: [],
            failed: [],
            priorComplete: []
        };

        for (let i = 0; i < values.length; ++i) {
            result[values[i].status].push(values[i]);
        }

        res.end(JSON.stringify(result));
    });
});

app.listen(port, (err) => {
    if (err) throw err;
    open("http://localhost:" + port);
});

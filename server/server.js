// Module imports
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import open from "open";
import { Promise } from "es6-promise";
import { getResult, getPostKey } from "./utils";

// Webpack configuration
import webpack from "webpack";
import config from "../webpack.config";

// Express setup
const port = 8000;
const app = express();
const compiler = webpack(config);
dotenv.config();

// Middleware setup
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(require("webpack-dev-middleware")(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

// Request handling begins here
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/index.html"));
});

// Individual result request
app.post("/api/Results/Individual", (req, res) => {
    let {startUSN, year, department, semester} = req.body;

    getPostKey().then(key => {
        getResult(key, startUSN.toString(), year.toString(), department.toLowerCase(),
            semester).then((result) => {
            if (result.gpa == 0 || result.error) {
                res.status(400);
                res.end();
                return;
            }

            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify(result));
        });
    });
});

app.post("/api/Results/Batch", (req, res) => {
    res.writeHead(200, {"Content-Type": "application/json"});

    getPostKey().then(key => {
        let start = req.body.startUSN;
        let end = req.body.endUSN;
        let {year, department, semester} = req.body;
        let failed = [];

        let promises = [];
        for (let i = start; i <= end; ++i) {
            promises.push(getResult(key, i.toString().padStart(3, "0"), 
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
});

app.listen(port, (err) => {
    if (err) throw err;
    open("http://localhost:" + port);
});

// Module imports
import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import open from "open";
import { Promise } from "es6-promise";
import { MongoClient as mongo } from "mongodb";

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

    mongo.connect("mongodb://localhost:27017").then((_db) => {
        let db = _db.db("results");

        let coll = db.collection("results");
        coll.findOne({
            year,
            department,
            usn: startUSN,
            semester
        }, (err, record) => {
            if (err) throw err;

            if (!record) {
                getPostKey().then(key => {
                    getResult(key, startUSN, year, department).then((result) => {
                        if (result.gpa == 0) {
                            res.status(400);
                            res.end();
                            return;
                        }

                        res.writeHead(200, {"Content-Type": "application/json"});
                        res.end(JSON.stringify(result));

                        let dbRecord = {
                            result,
                            year,
                            department: department.toLowerCase(),
                            usn: startUSN,
                            semester
                        };
                        coll.insertOne(dbRecord).then((val) => {
                            console.log("Successfully added new record to DB: " + val.insertedId);
                        }).catch((err) => {
                            console.error("Failed to add record:");
                            console.error(err);
                        });
                    }).catch(() => {
                        res.status(500);
                        res.end();
                    });
                });
            } else {
                console.log("Using cached result: " + record._id);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(record.result));
            }
        });
    });
});

app.post("/api/Results/Batch", (req, res) => {
    res.writeHead(200, {"Content-Type": "application/json"});

    getPostKey().then(key => {
        let start = req.body.startUSN;
        let end = req.body.endUSN;
        let {year, department} = req.body;
        let failed = [];

        let promises = [];
        for (let i = start; i <= end; ++i) {
            promises.push(getResult(key, i, year, department));
        }
        Promise.all(promises)
            .then(results => {
                // If some error occurred, gpa = 0.
                failed = results.filter(val => {
                    return val.gpa == 0;
                }).map(val => Number.parseInt(val.usn.substr(val.usn.length - 3)));

                results = results.filter(val => {
                    return val.gpa != 0;
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

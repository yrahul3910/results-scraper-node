import { Promise } from "es6-promise";
import request from "request";
import cheerio from "cheerio";
import _ from "lodash";
import { MongoClient as mongo } from "mongodb";

exports.getGrade = (marks) => {
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 45) return 5;
    if (marks >= 40) return 4;
    return 0;
};

exports.getPostKey = () => {
    return new Promise((resolve) => {
        request("http://results.vtu.ac.in/vitaviresultcbcs/index.php", (err, res, html) => {
            if (err) throw err;

            const $ = cheerio.load(html);
            resolve($("input[type='text']").first().attr("name"));
        });
    });
};

exports.getResult = (postKey, usn, year, dept, sem) => {
    let postData = {
        [postKey]: "1PE" + year.toString() + dept + usn.toString().padStart(3, "0")
    };

    return new Promise((resolve, reject) => {
        mongo.connect("mongodb://localhost:27017").then((client) => {
            let db = client.db("results");
            let coll = db.collection("results");

            coll.findOne({
                year,
                department: dept,
                usn,
                semester: sem
            }, (err, record) => {
                if (err) throw err;

                if (record) {
                    console.log("Using cached result: " + record._id);
                    resolve(record.result);
                } else {
                    request.post({url: "http://results.vtu.ac.in/vitaviresultcbcs/resultpage.php", form: postData},
                        (err, res, body) => {
                            if (err) throw err;

                            const $ = cheerio.load(body);
                            const name = $("td").eq(3).text().substr(2);
                            let tableNode = $("div.divTableBody").first().find("div.divTableRow");
                            tableNode = tableNode.filter((i, el) => {
                                return el.tagName != "text";
                            });

                            let subjectResults = [];
                            for (let i = 1; i < tableNode.length; ++i) {
                                let row = tableNode.eq(i);
                                let cells = row.children().filter((i, el) => {
                                    return el.tagName != "text";
                                });

                                // First check that the sem is right
                                let regex = /\d+[A-Z]+(\d+)/g;
                                let matches = regex.exec(cells.eq(0).text());
                                if (matches[1][0] != sem.toString()) {
                                    reject(new Error("Wrong semester"));
                                    return;
                                }

                                let subjectCredits;
                                if (cells.eq(1).text().endsWith("LAB") ||
                                    cells.eq(1).text().includes("LABORATORY"))
                                    subjectCredits = 2;
                                else if (cells.eq(0).text().length == 7)
                                    subjectCredits = 3;
                                else subjectCredits = 4;

                                let individualResult = {
                                    subjectCode: cells.first().text(),
                                    subjectName: cells.eq(1).text(),
                                    credits: subjectCredits,
                                    externalMarks: Number.parseInt(cells.eq(4).text()),
                                    passed: (cells.eq(5).text() == "P"),
                                    result: cells.eq(5).text()[0]
                                };
                                subjectResults.push(individualResult);
                            }

                            let gpa = _.sumBy(subjectResults, ob => exports.getGrade(ob.externalMarks) * ob.credits);
                            gpa /= _.sumBy(subjectResults, ob => ob.credits);
                            gpa = Math.round(gpa * 100) / 100;

                            resolve({
                                subjectResults,
                                gpa,
                                studentName: name,
                                usn: "1PE" + year.toString() + dept + usn.toString().padStart(3, "0")
                            });

                            let result = {
                                subjectResults,
                                gpa,
                                studentName: name,
                                usn
                            };

                            let dbRecord = {
                                result,
                                year: year.toString(),
                                department: dept.toLowerCase(),
                                usn: usn.toString(),
                                semester: sem
                            };
                            coll.insertOne(dbRecord).then(val => {
                                console.log("Successfully added new record to DB: " + val.insertedId);
                            }).catch((err) => {
                                console.error("Failed to add record:");
                                console.error(err);
                            });
                        }
                    );
                }
            });
        });
    });
};

module.exports = exports;

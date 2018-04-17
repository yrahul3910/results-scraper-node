import { Promise } from "es6-promise";
import request from "request";
import cheerio from "cheerio";
import _ from "lodash";
import { MongoClient as mongo } from "mongodb";

/**
 * The default implementation of the marks function used in `scrapeResults`.
 * @param {Cheerio} cells -- An array of the cells in one row of the results table.
 */
const defaultMarksFunction = cells => Number.parseInt(cells.eq(4).text());

/**
 * Scrapes the results given the HTML of the results page. Optionally takes a function
 * to compute the external marks given all the cells in one row of the table. This function
 * is useful for revaluation, since external marks and internal marks must be added.
 * @param {string} body -- The body of the results page, an HTML string.
 * @param {string} sem -- A string representation of the semester.
 * @param {string} usn -- A string representation of the last digits in the USN.
 * @param {Function} marksFn -- A function to compute the marks given the cells in a row of the table.
 */
const scrapeResults = (body, sem, usn, marksFn = defaultMarksFunction) => {
    try {
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
            if (matches[1][0] != sem.toString())
                return false;

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
                externalMarks: marksFn(cells),
                passed: (cells.eq(5).text() == "P"),
                result: cells.eq(5).text()[0]
            };
            subjectResults.push(individualResult);
        }

        return subjectResults;
    } catch (e) {
        return false;
    }
}

/**
 * Returns the corresponding grade for the marks given.
 * @param {number} marks -- The marks to find the grade for.
 */
const getGrade = marks => {
    if (marks >= 90) return 10;
    if (marks >= 80) return 9;
    if (marks >= 70) return 8;
    if (marks >= 60) return 7;
    if (marks >= 50) return 6;
    if (marks >= 45) return 5;
    if (marks >= 40) return 4;
    return 0;
};

/**
 * Gets the key to send in the POST request while scraping results.
 */
const getPostKey = () => {
    return new Promise(resolve => {
        request("http://results.vtu.ac.in/vitaviresultcbcs/index.php", (err, res, html) => {
            if (err) throw err;

            const $ = cheerio.load(html);
            resolve($("input[type='text']").first().attr("name"));
        });
    });
};

/**
 * Checks revaluation results, and updates in the database if necessary.
 * Returns a Promise, that resolves to an object, with a status and a usn field.
 * The status field may be one of "success", "failed", or "priorComplete". 
 * @param {string} postKey -- The key to send with the POST request to fetch results.
 * @param {string} usn -- The last few digits in the USN, including the initial zeros.
 * @param {string} year -- A string version of the year part of the USN.
 * @param {string} dept -- An all-lowercase string of the department in the USN.
 * @param {string} sem -- A string representation of the semester.
 */
const updateReval = (postKey, usn, year, dept, sem) => {
    return new Promise(resolve => {
        mongo.connect("mongodb://localhost:27017", (err, client) => {
            let db = client.db("results");

            let coll = db.collection("results");
            let postData = {
                [postKey]: "1PE" + year + dept + usn
            };

            coll.findOne({
                year,
                department: dept,
                usn,
                semester: sem
            }, (err, record) => {
                if (err) throw err;

                if (!record) {
                    resolve({
                        usn,
                        status: "failed",
                        reason: "Results not cached yet. Please scrape the results first."
                    });
                    return;
                }

                if (record.revalUpdated) {
                    resolve({
                        usn,
                        status: "priorComplete"
                    });
                    return;
                }

                request.post({
                    url: "http://results.vtu.ac.in/vitavirevalresultcbcs/resultpage.php",
                    form: postData
                }, (err, res, body) => {
                    if (err) throw err;

                    let subjectResults = scrapeResults(body, sem, usn,
                        cells => Number.parseInt(cells.eq(2).text()) +
                            Number.parseInt(cells.eq(4).text())
                    );

                    if (!subjectResults) {
                        resolve({
                            usn,
                            status: "failed",
                            reason: "Could not scrape website or wrong sem."
                        });
                        return;
                    }

                    // Compute the new GPA
                    for (let i = 0; i < record.result.subjectResults.length; ++i) {
                        let flag = false;
                        for (let j = 0; j < subjectResults.length; ++j) {
                            if (record.result.subjectResults[i].subjectCode ==
                                subjectResults[j].subjectCode) {

                                record.result.subjectResults[i].externalMarks =
                                    subjectResults[j].externalMarks;
                                flag = true;
                            }
                        }

                        if (flag) {
                            let gpa = _.sumBy(record.result.subjectResults,
                                ob => getGrade(ob.externalMarks) * ob.credits);
                            gpa /= _.sumBy(record.result.subjectResults, ob => ob.credits);
                            record.result.gpa = Math.round(gpa * 100) / 100;
                        }
                    }
                    
                    coll.updateOne({
                        year,
                        department: dept,
                        usn,
                        semester: sem
                    }, {
                            $set: {
                                result: record.result,
                                revalUpdated: true
                            }
                        }, (err, result) => {
                            if (err) throw err;

                            console.log("Successfully updated record for USN " + usn);
                        }
                    );

                    resolve({
                        usn,
                        status: "success",
                    });
                });
            });
        });
    });

}

/**
 * Get the results (not revaluation) for a given USN.
 * @param {string} postKey -- The key to send with the POST request to fetch results.
 * @param {string} usn -- The last few digits in the USN, including the initial zeros.
 * @param {string} year -- A string version of the year part of the USN.
 * @param {string} dept -- An all-lowercase string of the department in the USN.
 * @param {string} sem -- A string representation of the semester.
 */
const getResult = (postKey, usn, year, dept, sem) => {
    // 3 for 1PE, 2 for year 
    let usnLen = 5 + dept.length;
    let postData = {
        [postKey]: "1PE" + year.toString() + dept + usn.toString().padStart(10 - usnLen, "0")
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
                    request.post({ url: "http://results.vtu.ac.in/vitaviresultcbcs/resultpage.php", form: postData },
                        (err, res, body) => {
                            if (err) throw err;

                            let subjectResults = scrapeResults(body, sem, usn);
                            if (!subjectResults) {
                                resolve({ error: true, usn });
                                return;
                            }

                            let gpa = _.sumBy(subjectResults, ob => getGrade(ob.externalMarks) * ob.credits);
                            gpa /= _.sumBy(subjectResults, ob => ob.credits);
                            gpa = Math.round(gpa * 100) / 100;

                            if (isNaN(gpa) || gpa == 0) {
                                console.log("Result fetch failed for USN " + usn);
                                resolve({ error: true, usn });
                                return;
                            }

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
                                console.log("Successfully added new record to DB for USN" +
                                    usn + ": " + val.insertedId);
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

export { getGrade, getResult, updateReval, getPostKey };

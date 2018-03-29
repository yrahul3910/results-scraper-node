import { Promise } from "es6-promise";
import request from "request";
import cheerio from "cheerio";
import _ from "lodash";

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

exports.getResult = (postKey, usn, year, dept) => {
    let postData = {
        [postKey]: "1PE" + year.toString() + dept + usn.toString().padStart(3, "0")
    };

    return new Promise((resolve) => {
        request.post({url: "http://results.vtu.ac.in/vitaviresultcbcs/resultpage.php", form: postData},
            (err, res, body) => {
                if (err) throw err;

                const $ = cheerio.load(body);
                const name = $("td").eq(3).text().substr(2);
                const tableNode = $("div.divTableBody").first().find("div.divTableRow");

                let subjectResults = [];
                for (let i = 1; i < 9; ++i) {
                    let row = tableNode.eq(i);
                    let cells = row.children().filter((i, el) => {
                        return el.tagName != "text";
                    });

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
            }
        );
    });
};

module.exports = exports;
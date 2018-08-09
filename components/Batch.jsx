/* eslint-disable no-undef */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import SideMenu from "./SideMenu.jsx";
import ChartCard from "./ChartCard.jsx";
import BarChartCard from "./BarChartCard.jsx";
import randomColor from "randomcolor";
import { Link } from "react-router-dom";
import "../src/progress.css";

class Batch extends React.Component {
    constructor(props) {
        super(props);
        this.state = { results: null, requestSent: false };
        this.click = this.click.bind(this);
    }

    getGrade(marks) {
        if (marks >= 90) return "S+";
        if (marks >= 80) return "S";
        if (marks >= 70) return "A";
        if (marks >= 60) return "B";
        if (marks >= 50) return "C";
        if (marks >= 45) return "D";
        if (marks >= 40) return "E";
        return "F";
    }

    click() {
        let startUsn = $("#startUsn").val();
        let endUsn = $("#endUsn").val();

        let regex = /(\d+)([A-Za-z]+)(\d+)/g;
        let matches = regex.exec(startUsn);
        let endMatches = /(\d+)([A-Za-z]+)(\d+)/g.exec(endUsn);

        this.setState({ requestSent: true, results: null });
        $.ajax({
            method: "POST",
            url: "/api/Results/Batch",
            data: JSON.stringify({
                year: matches[1],
                department: matches[2],
                startUSN: matches[3],
                endUSN: endMatches[3],
                semester: $("#batchSemester").val()
            }),
            contentType: "application/json",
            success: (data) => {
                this.props.updateFunc(data);
                this.setState({ results: data });
            }
        });
    }

    render() {
        let subResults = this.state.results ? this.state.results.results.map(val => val.subjectResults) : null;
        // All the elements of subResults are arrays of the same length.
        // subResults contains an array of each student's results.

        let chartsDivs;
        let failedDiv;
        let barChartsDiv;
        if (subResults) {
            if (subResults.length == 0) {
                chartsDivs = <div></div>;
                failedDiv =
                    <div>
                        <p className="text-center" style={{ color: "red" }}>
                            Could not fetch results for any USN in range.
                        </p>
                    </div>;
            } else {
                let chartsData = [];
                let subjectGrades = [];

                /* First compute the data required to plot the grade-wise bar charts.
                We first initialize a 2D array of dimensions 8 x n, where n is the
                number of subjects. Then, for each subject, compute the count of each
                grade. */
                for (let i = 0; i < 8; ++i) {
                    subjectGrades.push([]);
                    for (let j = 0; j < subResults[0].length; ++j)
                        subjectGrades[i].push(0);
                }

                let gradeIndexMap = {
                    "S+": 0, "S": 1, "A": 2,
                    "B": 3, "C": 4, "D": 5,
                    "E": 6, "F": 7
                };
                let indexGradeMap = _.invert(gradeIndexMap);

                for (let i = 0; i < subjectGrades.length; ++i) {
                    // Iterate over the subjects
                    subResults.map(x => x[i]).forEach(subObj => {
                        let grade = this.getGrade(subObj.externalMarks);
                        subjectGrades[gradeIndexMap[grade]][i]++;
                    });
                }

                let barColors = [];
                for (let i = 0; i < subResults[0].length; ++i)
                    barColors.push(randomColor({
                        format: "rgba",
                        alpha: 0.4
                    }));
                let splitChartData = _.chunk(subjectGrades, 3);

                /* Display the title, subject code to subject name mapping, and
                the grade-wise bar charts. */
                barChartsDiv = (
                    <div>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                            Grade-wise results
                        </p>

                        {subResults[0].map((sub, i) =>
                            <p key={i}><strong>{sub.subjectCode}: </strong>{sub.subjectName}</p>
                        )}

                        {splitChartData.map((chunkSubGrades, i) =>
                            <div className="row" style={{ marginTop: "15px" }} key={i}>
                                {chunkSubGrades.map((gradeRow, index) =>
                                    <div className="custom-col-30" key={index}>
                                        <BarChartCard id={`bar${i}${index}`}
                                            backgroundColor={barColors}
                                            chartLabel={"Grade " + indexGradeMap[i * 3 + index]}
                                            data={gradeRow}
                                            subjectList={subResults[0].map(x => x.subjectCode)} />
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                );

                // Compute subject-wise grade counts for the pie charts and tables.
                for (let i = 0; i < subResults[0].length; ++i) {
                    let curSubGradeCounts = _.countBy(subResults, val => {
                        if (val[i].result == "A")
                            return "AB";
                        return this.getGrade(val[i].externalMarks);
                    });

                    chartsData.push(curSubGradeCounts);
                }

                failedDiv = (
                    <div>
                        <p className="text-center" style={{ color: "red" }}>
                            Scraping failed for USNs: {this.state.results.failedResults.join(", ")}
                        </p>
                        <div className="row">
                            <div className="col-md-3 col-md-offset-4">
                                <Link to="/report">
                                    <button className="btn btn-success">Generate Report</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                );

                chartsDivs = chartsData.map((dataMap, index) => {
                    let grades = ["S+", "S", "A", "B", "C", "D", "E", "F", "AB"];
                    let keys = Object.keys(chartsData[index]);
                    let missingKeys = _.difference(grades, keys);

                    for (let key of missingKeys)
                        chartsData[index][key] = 0;

                    return (
                        <ChartCard key={index}
                            title={subResults[0][index].subjectName}
                            id={subResults[0][index].subjectCode}
                            chartLabels={grades}
                            chartFrequencies={grades.map(val => chartsData[index][val])} />
                    );
                });
            }
        } else {
            // Show a progress bar instead
            chartsDivs = this.state.requestSent ?
                <div style={{ marginLeft: "33.33%" }} className="loader8"></div> :
                <div></div>;
            failedDiv = <div></div>;
            barChartsDiv = <div></div>;
        }

        return (
            <div style={{ marginLeft: "25%" }}>
                <SideMenu />
                <h3 className="text-center">Batch Results</h3>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="form-group col-md-4 col-md-offset-4">
                        <label htmlFor="startUsn">Start USN</label>
                        <div className="input-group">
                            <span className="input-group-addon">1PE</span>
                            <input id="startUsn" type="text" className="form-control" placeholder="USN" />
                        </div>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="form-group col-md-4 col-md-offset-4">
                        <label htmlFor="endUsn">End USN</label>
                        <div className="input-group">
                            <span className="input-group-addon">1PE</span>
                            <input id="endUsn" type="text" className="form-control" placeholder="USN" />
                        </div>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="form-group col-md-4 col-md-offset-4">
                        <label htmlFor="batchSemester">Semester</label>
                        <select className="form-control" id="batchSemester" style={{ width: "25%" }}>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                        </select>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="col-md-4 col-md-offset-4">
                        <button onClick={this.click} className="btn btn-success">Get Results</button>
                    </div>
                </div>
                <div style={{ marginTop: "15px" }}>
                    {chartsDivs}
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    {failedDiv}
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    {barChartsDiv}
                </div>
            </div>
        );
    }
}

Batch.propTypes = {
    updateFunc: PropTypes.func.isRequired
};

export default Batch;

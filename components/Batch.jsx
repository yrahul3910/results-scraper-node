/* eslint-disable no-undef */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import SideMenu from "./SideMenu.jsx";
import ChartCard from "./ChartCard.jsx";
import BarCharts from "./BarCharts.jsx";
import randomColor from "randomcolor";
import { Link } from "react-router-dom";
import { getFormattedSubjectCode } from "../src/utils";
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
        let subCodesDiv;

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
                let chartsData = {};
                let subjectGrades = [];

                /* First compute the data required to plot the grade-wise bar charts.
                We first initialize a 2D array of dimensions 8 x n, where n is the
                number of subjects. 9 because there are 8 possible grades, and absent. */
                for (let i = 0; i < 9; ++i)
                    subjectGrades.push({});

                let gradeIndexMap = {
                    "S+": 0, "S": 1, "A": 2,
                    "B": 3, "C": 4, "D": 5,
                    "E": 6, "F": 7, "AB": 8
                };
                let indexGradeMap = _.invert(gradeIndexMap);

                /* Populate subjectGrades */
                for (let i = 0; i < subResults.length; ++i) {
                    for (let subject of subResults[i]) {
                        /* First get the subject code, and generalize if it's an
                        elective. */
                        let code = getFormattedSubjectCode(subject.subjectCode);

                        // Next, compute the grade and store it in the right map.
                        let grade;
                        if (subject.result == "A") {
                            console.log(subject.subjectCode + " " + this.state.results.results[i].usn + " AB");
                            grade = "AB";
                        }
                        else if (subject.result == "F") {
                            console.log(subject.subjectCode + " " + this.state.results.results[i].usn + " F");
                            grade = "F";
                        }
                        else 
                            grade = this.getGrade(subject.externalMarks);

                        if (subjectGrades[gradeIndexMap[grade]].hasOwnProperty(code))
                            subjectGrades[gradeIndexMap[grade]][code]++;
                        else
                            subjectGrades[gradeIndexMap[grade]][code] = 1;
                    }
                }

                /* Now use subjectGrades to build the data for the pie charts
                subjectGrades mapped (gradeIndex x subjectCode) --> count, 
                chartsData should map (subjectCode x gradeIndex) --> count. */
                for (let i = 0; i < 9; ++i) {
                    for (let subject of Object.keys(subjectGrades[i])) {
                        if (chartsData.hasOwnProperty(subject))
                            chartsData[subject][i] = subjectGrades[i][subject];
                        else {
                            chartsData[subject] = new Array(9);
                            chartsData[subject].fill(0);
                            chartsData[subject][i] = subjectGrades[i][subject];
                        }
                    }
                }

                let barColors = [];
                for (let i = 0; i < subResults[0].length; ++i)
                    barColors.push(randomColor({
                        format: "rgba",
                        alpha: 0.4
                    }));
                
                barChartsDiv = 
                    <BarCharts subjectGrades={subjectGrades}
                        subResults={subResults}
                        barColors={barColors}
                        indexGradeMap={indexGradeMap} />;                

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

                chartsDivs = Object.keys(chartsData).map((subCode, index) => 
                    <ChartCard key={index}
                        title={subCode}
                        id={subCode}
                        chartLabels={Object.keys(gradeIndexMap)}
                        chartFrequencies={chartsData[subCode]} />
                );

                subCodesDiv = 
                    <div>
                        {subResults[0].map((sub, i) =>
                            <p key={i}>
                                <strong>{getFormattedSubjectCode(sub.subjectCode)}: </strong>
                                {sub.subjectName}
                            </p>
                        )}
                    </div>
            }
        } else {
            // Show a progress bar instead
            chartsDivs = this.state.requestSent ?
                <div style={{ marginLeft: "33.33%" }} className="loader8"></div> :
                <div></div>;
            failedDiv = <div></div>;
            barChartsDiv = <div></div>;
            subCodesDiv = <div></div>;
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
                    {subCodesDiv}
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

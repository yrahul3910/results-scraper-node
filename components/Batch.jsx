/* eslint-disable no-undef */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import SideMenu from "./SideMenu.jsx";
import ChartCard from "./ChartCard.jsx";
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

        this.setState({ requestSent: true });
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

        let chartsDivs;
        let failedDiv;
        if (subResults) {
            let chartsData = [];
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
        } else {
            // Show a spinning progress bar instead
            chartsDivs = this.state.requestSent ? 
                <div style={{ marginLeft: "33.33%" }} className="loader8"></div> : 
                <div></div>;
            failedDiv = <div></div>;
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
            </div>
        );
    }
}

Batch.propTypes = {
    updateFunc: PropTypes.func.isRequired
};

export default Batch;

/* eslint-disable no-undef */
import React from "react";
import SideMenu from "./SideMenu.jsx";
import IndividualTable from "./IndividualTable.jsx";

class Individual extends React.Component {
    constructor(props) {
        super(props);
        this.state = { results: null };
        this.click = this.click.bind(this);
    }

    click() {
        let usn = $("#individualUsn").val();
        let regex = /(\d+)([A-Za-z]+)(\d+)/g;
        let matches = regex.exec(usn);

        $.ajax({
            method: "POST",
            url: "/api/Results/Individual",
            data: JSON.stringify({
                year: matches[1],
                department: matches[2],
                startUSN: matches[3],
                endUSN: "1",
                semester: $("select").val()
            }),
            contentType: "application/json",
            success: (data) => {
                this.setState({ results: data });
            },
            error: () => {
                $("#errorMessage").html("Invalid options. Check USN and semester.");
            }
        });
    }

    render() {
        let gpaDiv = this.state.results ? (
            <div className="row" style={{ marginTop: "15px" }}>
                <div className="col-md-4 col-md-offset-5">
                    <strong>GPA: </strong><span>{this.state.results.gpa}</span>
                </div>
            </div>
        ) : <div></div>;

        return (
            <div style={{ marginLeft: "25%" }}>
                <SideMenu />
                <h3 className="text-center">Individual Results</h3>
                <p className="text-center" style={{color: "red"}} id="errorMessage"></p>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="form-group col-md-4 col-md-offset-4">
                        <label htmlFor="individualUsn">USN</label>
                        <div className="input-group">
                            <span className="input-group-addon">1PE</span>
                            <input id="individualUsn" maxLength="7" type="text" className="form-control" placeholder="USN" />
                        </div>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="form-group col-md-4 col-md-offset-4">
                        <label htmlFor="individualSemester">Semester</label>
                        <select className="form-control" style={{ width: "25%" }}>
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
                    <div className="col-md-4 col-md-offset-5">
                        <button onClick={this.click} className="btn btn-success">Get Results</button>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="col-md-8 col-md-offset-2">
                        <IndividualTable tableData={this.state.results? this.state.results.subjectResults : null} />
                    </div>
                </div>
                {gpaDiv}
            </div>
        );
    }
}

export default Individual;

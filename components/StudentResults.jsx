import React from "react";
import SideMenu from "./SideMenu.jsx";
import IndividualTable from "./IndividualTable.jsx";

export default class StudentResults extends React.Component {
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
            url: "/api/Results/Student",
            data: JSON.stringify({
                year: matches[1],
                department: matches[2],
                usn: matches[3],
                endUSN: "1",
            }),
            contentType: "application/json",
            success: (data) => {
                this.setState({ results: data });
                $("#errorMessage").html("");
            },
            error: () => {
                $("#errorMessage").html("Could not process request. Make sure some results have " +
                    "been scraped for this USN before.");
            }
        });
    }

    render() {
        let tables = this.state.results ? (
            this.state.results.map((semResult, i) =>
                <React.Fragment key={i}>
                    <div className="row">
                        <div className="col-md-4 col-md-offset-5">
                            <strong>Semester: </strong>{semResult.semester}
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "15px" }}>
                        <div className="col-md-8 col-md-offset-2">
                            <IndividualTable tableData={semResult.result.subjectResults} />
                        </div>
                    </div>
                    <div className="row" style={{ marginTop: "15px" }}>
                        <div className="col-md-4 col-md-offset-5">
                            <strong>GPA: </strong><span>{semResult.result.gpa}</span>
                        </div>
                    </div>
                </React.Fragment>
            )
        ) : <div></div>;

        return (
            <div style={{ marginLeft: "25%" }}>
                <SideMenu />
                <h3 className="text-center">Student Results</h3>
                <p className="text-center" style={{ color: "red" }} id="errorMessage"></p>
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
                    <div className="col-md-4 col-md-offset-5">
                        <button onClick={this.click} className="btn btn-success">Get Results</button>
                    </div>
                </div>
                <div className="row" style={{ marginTop: "15px" }}>
                    {tables}
                </div>
            </div>
        );
    }
}

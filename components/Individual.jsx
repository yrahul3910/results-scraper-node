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
        // TODO: Perform validation

        let usn = $("#individualUsn").val();
        $.ajax({
            method: "POST",
            url: "/api/Results/Individual",
            data: JSON.stringify({
                year: usn.substr(0, 2),
                department: usn.substr(2, 2),
                startUSN: usn.substr(usn.length - 3),
                endUSN: "1"
            }),
            contentType: "application/json",
            success: (data) => {
                this.setState({ results: data });
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
                <div className="row" style={{ marginTop: "15px" }}>
                    <div className="input-group col-md-4 col-md-offset-4">                        
                        <span className="input-group-addon">1PE</span>
                        <input id="individualUsn" type="text" class="form-control" placeholder="USN" />
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
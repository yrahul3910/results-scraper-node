import React from "react";
import SideMenu from "./SideMenu.jsx"

class UpdateReval extends React.Component {
    constructor(props) {
        super(props);

        this.state = { requestSent: false, updateResult: null };
        this.click = this.click.bind(this);
    }

    click() {
        let startUsn = $("#startUsn").val();
        let endUsn = $("#endUsn").val();

        let regex = /(\d+)([A-Za-z]+)(\d+)/g;
        let matches = regex.exec(startUsn);
        let endMatches = /(\d+)([A-Za-z]+)(\d+)/g.exec(endUsn);

        this.setState({ requestSent: true, updateResult: null });
        $.ajax({
            method: "POST",
            url: "/api/Results/RevalUpdate",
            data: JSON.stringify({
                year: matches[1],
                department: matches[2],
                startUSN: matches[3],
                endUSN: endMatches[3],
                semester: $("#batchSemester").val()
            }),
            contentType: "application/json",
            success: (data) => {
                this.setState({ updateResult: data });
            }
        });
    }

    render() {
        let tableDiv = this.state.updateResult ? (
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>List of USNs</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Updated in the database</td>
                        <td>{this.state.updateResult.success.map(x => x.usn).join(", ")}</td>
                    </tr>
                    <tr>
                        <td>Failed to update</td>
                        <td>{this.state.updateResult.failed.map(x => x.usn).join(", ")}</td>
                    </tr>
                    <tr>
                        <td>Previously updated in database</td>
                        <td>{this.state.updateResult.priorComplete.map(x => x.usn).join(", ")}</td>
                    </tr>
                </tbody>
            </table>
        ) : null;

        return (<div style={{ marginLeft: "25%" }}>
            <SideMenu />
            <h3 className="text-center">Update Revaluation Results in Database</h3>
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
                    <button onClick={this.click} className="btn btn-success">Update Database</button>
                </div>
            </div>
            {tableDiv}
        </div>);
    }
}

export default UpdateReval;
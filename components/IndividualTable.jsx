import React from "react";
import PropTypes from "prop-types";

class IndividualTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let tableRows = this.props.tableData ? this.props.tableData.map((val, i) =>
            <tr key={i}>
                <td>{val.subjectCode}</td>
                <td>{val.subjectName}</td>
                <td>{val.credits}</td>
                <td>{val.externalMarks}</td>
                <td>{val.passed ? "Yes" : "No"}</td>
            </tr>
        ) : <tr></tr>;

        return this.props.tableData ? (
            <table className="table table-hover">
                <caption style={{ fontWeight: "bold", textAlign: "center", color: "black" }}>
                    {"Name: " + this.props.name}
                </caption>
                <thead>
                    <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Credits</th>
                        <th>External Marks</th>
                        <th>Passed</th>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
        ) : null;
    }
}

IndividualTable.propTypes = {
    tableData: PropTypes.array,
    name: PropTypes.string
};

export default IndividualTable;
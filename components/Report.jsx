import React from "react";
import PropTypes from "prop-types";
import { getFormattedSubjectCode } from "../src/utils";

class Report extends React.Component {
    render() {
        let resultList = this.props.data.results;

        let subCodes = resultList[0].subjectResults.map(res => 
            getFormattedSubjectCode(res.subjectCode));

            // Table headers
        let headers = subCodes.map(x => getFormattedSubjectCode(x))
                            .map((x, i) => <th key={i}>{x}</th>);

        let rows = resultList.map((val, i) => {
            // val represents one student's results.
            let name = val.studentName;
            let gpa = val.gpa;
            let curCodes = val.subjectResults.map(sub => 
                getFormattedSubjectCode(sub.subjectCode));

            let marks = [];
            for (let code of subCodes) {
                let index = curCodes.indexOf(code);
                marks.push(<td>{val.subjectResults[index].externalMarks}</td>);
            }
            return (
                <tr key={i}>
                    <td>{val.usn}</td>
                    <td>{name}</td>
                    {marks}
                    <td>{gpa}</td>
                </tr>
            );
        });

        return (
            <div className="container-fluid">
                <div className="row">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>USN</th>
                                <th>Name</th>
                                {headers}
                                <th>GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

Report.propTypes = {
    data: PropTypes.object.isRequired
};

export default Report;

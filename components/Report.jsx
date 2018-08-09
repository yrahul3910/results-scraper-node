import React from "react";
import PropTypes from "prop-types";

class Report extends React.Component {
    getFormattedSubjectCode(x) {
        let rgx = /(\d+)([A-Z]+)(\d+)/;
        let matches = x.match(rgx);
        if (matches[2].length == 2 && matches[3].length == 3)
            return x.substr(0, x.length - 1) + "x";
        return x;
    }

    render() {
        let resultList = this.props.data.results;

        let subCodes = resultList[0].subjectResults.map(res => 
            this.getFormattedSubjectCode(res.subjectCode));

            // Table headers
        let headers = subCodes.map(x => this.getFormattedSubjectCode(x))
                            .map((x, i) => <th key={i}>{x}</th>);

        let rows = resultList.map((val, i) => {
            // val represents one student's results.
            let name = val.studentName;
            let gpa = val.gpa;
            let curCodes = val.subjectResults.map(sub => 
                this.getFormattedSubjectCode(sub.subjectCode));

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

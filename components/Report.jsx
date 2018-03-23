import React from "react";
import PropTypes from "prop-types";

class Report extends React.Component {
    render() {
        let resultList = this.props.data.results;
        let rows = resultList.map((val, i) => {
            let name = val.studentName;
            let gpa = val.gpa;
            let subjectResults = val.subjectResults.map((sub, j) =>
                <td key={j}>{sub.externalMarks}</td>
            );
            console.log(val);
            return (
                <tr key={i}>
                    <td>{val.usn}</td>
                    <td>{name}</td>
                    {subjectResults}
                    <td>{gpa}</td>
                </tr>
            );
        });

        let subjectList = resultList.map((res, i) => {
            if (res.subjectResults.credits == 3)
                return <p key={i}><strong>ELECTIVE</strong></p>;
            else
                return <p key={i}><strong>{res.subjectResults.subjectName}</strong></p>;
        });

        return (
            <div className="container-fluid">
                <div className="row">
                    {subjectList}
                </div>
                <div className="row">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>USN</th>
                                <th>NAME</th>
                                <th>SUB 1</th>
                                <th>SUB 2</th>
                                <th>SUB 3</th>
                                <th>SUB 4</th>
                                <th>SUB 5</th>
                                <th>SUB 6</th>
                                <th>SUB 7</th>
                                <th>SUB 8</th>
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
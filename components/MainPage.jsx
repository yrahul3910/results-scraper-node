import React from "react";
import SideMenu from "./SideMenu.jsx";

class MainPage extends React.Component {
    render() {
        return (
            <React.Fragment>
                <SideMenu />
                <div style={{ marginLeft: "25vw", marginTop: "10vh", marginRight: "10vw" }}>
                    <h3>
                        Welcome to the PES University, Electronic City result scraper
                    </h3>
                    <div style={{ marginTop: "10vh" }}>
                        <span style={{ borderWidth: "2px", borderRadius: "50%",
                            padding: "5px 9px", borderStyle: "solid", marginRight: "15px"}}>
                            1
                        </span>
                        <span><strong>Fetching individual results</strong></span>
                        <p style={{ marginTop: "15px", marginLeft: "46px" }}>Go to the <em>Individual Results</em> tab, enter the USN and the
                        semester for the student. The results will be displayed in a table,
                        along with the GPA.</p>
                    </div>
                    <div style={{ marginTop: "10vh" }}>
                        <span style={{ borderWidth: "2px", borderRadius: "50%",
                            padding: "5px 9px", borderStyle: "solid", marginRight: "15px"}}>
                            2
                        </span>
                        <span><strong>Fetching batch results</strong></span>
                        <p style={{ marginTop: "15px", marginLeft: "46px" }}>Go to the <em>Batch Result</em> tab, enter the USN range and the
                        semester for the students. The results will be displayed in pie charts, with
                        statistics for each subject. Please save the page if you wish to keep the charts.
                        There is also an option to generate a printable report at the bottom of the page.</p>
                    </div>
                    <div style={{ marginTop: "10vh" }}>
                        <span style={{ borderWidth: "2px", borderRadius: "50%",
                            padding: "5px 9px", borderStyle: "solid", marginRight: "15px"}}>
                            3
                        </span>
                        <span><strong>Updating database results</strong></span>
                        <p style={{ marginTop: "15px", marginLeft: "46px" }}>Go to the <em>Update Reval Results</em> tab, enter the USN range and the
                        semester for the student. The results of updating the database are shown in
                        a table. Note that to update the database, the USN results must be scraped
                        first, using either individual or batch results.</p>
                    </div>
                    <div style={{ marginTop: "10vh" }}>
                        <span style={{ borderWidth: "2px", borderRadius: "50%",
                            padding: "5px 9px", borderStyle: "solid", marginRight: "15px"}}>
                            4
                        </span>
                        <span><strong>Student-wise results</strong></span>
                        <p style={{ marginTop: "15px", marginLeft: "46px" }}>
                            To obtain all the semesters' results for a student, go to <em>Student Results</em>,
                            and enter the USN. Note that for this to work, the student's results must have been
                            scraped for at least one semester.
                        </p>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default MainPage;

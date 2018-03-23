import React from "react";
import SideMenu from "./SideMenu.jsx";

class MainPage extends React.Component {
    render() {
        return (
            <React.Fragment>
                <SideMenu />
                <div style={{ marginLeft: "25%", marginTop: "20%" }}>
                    <p>
                        Welcome to the PESIT South Campus result scraper. Click the Individual tab for
                        individual results, and the Batch tab for multiple results at once.
                    </p>
                </div>
            </React.Fragment>
        );
    }
}

export default MainPage;
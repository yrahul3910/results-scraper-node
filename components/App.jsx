import React from "react";
import MainPage from "./MainPage.jsx";
import Individual from "./Individual.jsx";
import Batch from "./Batch.jsx";
import Report from "./Report.jsx";
import UpdateReval from "./UpdateReval.jsx";
import StudentResults from "./StudentResults.jsx";
import { Switch, Route } from "react-router-dom";
import "../src/site.css";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.updateBatchResults = this.updateBatchResults.bind(this);
        this.state = { batchResults: null };
    }

    updateBatchResults(data) {
        this.setState({ batchResults: data });
    }

    render() {
        return (
            <Switch>
                <Route exact path="/" component={MainPage} />
                <Route exact path="/individual" component={Individual} />
                <Route exact path="/batch" render={() =>
                    <Batch updateFunc={this.updateBatchResults} />
                } />
                <Route exact path="/report" render={() =>
                    <Report data={this.state.batchResults} />
                } />
                <Route exact path="/update" component={UpdateReval} />
                <Route exact path="/student" component={StudentResults} />
            </Switch>
        );
    }
}

export default App;

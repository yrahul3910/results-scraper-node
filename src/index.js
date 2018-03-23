import React from "react";
import { HashRouter as Router } from "react-router-dom";
import ReactDOM from "react-dom";
import App from "../components/App.jsx";
import "./site.css";

ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById("app")
);

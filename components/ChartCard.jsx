import React from "react";
import Chart from "chart.js";
import PropTypes from "prop-types";

class ChartCard extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let canvas = document.getElementById(this.props.id);
        let chart = new Chart(canvas, {
            type: "pie",
            data: {
                labels: this.props.chartLabels,
                datasets: [{
                    data: this.props.chartFrequencies,
                    backgroundColor: [
                        "#00FF00",
                        "#7DE800",
                        "#AAD000",
                        "#CAB500",
                        "#E29700",
                        "#F27600",
                        "#FC4F00",
                        "#FF0000",
                        "#1E1E1E"
                    ]
                }],
            }
        });
    }

    render() {
        let tableValues = this.props.chartFrequencies.map((val, i) =>
            <td key={i}>{val}</td>
        );

        return (
            <div className="row">
                <div className="card">
                    <div className="col-md-3">
                        <p className="text-center" style={{ marginTop: "10px" }}>
                            <strong>{this.props.title}</strong>
                        </p>
                        <canvas style={{ marginBottom: "10px" }} id={this.props.id} width="100%" height="100%"></canvas>
                    </div>
                    <div className="col-md-8">
                        <table className="table table-hover" style={{marginTop: "20px"}}>
                            <tbody>
                                <tr>
                                    <td><strong>Grade</strong></td>
                                    <td>S+</td>
                                    <td>S</td>
                                    <td>A</td>
                                    <td>B</td>
                                    <td>C</td>
                                    <td>D</td>
                                    <td>E</td>
                                    <td>F</td>
                                    <td>AB</td>
                                </tr>
                                <tr>
                                    <td><strong>Count</strong></td>
                                    {tableValues}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

ChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    chartLabels: PropTypes.array.isRequired,
    chartFrequencies: PropTypes.array.isRequired
};

export default ChartCard;
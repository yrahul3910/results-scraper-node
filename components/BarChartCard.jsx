import React from "react";
import PropTypes from "prop-types";
import Chart from "chart.js";

class BarChartCard extends React.Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    componentDidMount() {
        let ctx = document.getElementById(this.props.id);
        let chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: this.props.subjectList,
                datasets: [{
                    label: this.props.chartLabel,
                    backgroundColor: this.props.backgroundColor,
                    data: this.props.data,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                },
                tooltips: {
                    displayColors: false
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: this.props.chartLabel
                }
            }
        });
    }

    render() {
        return (
            <div className="card">
                <canvas id={this.props.id} width="100%" height="100%"></canvas>
            </div>
        );
    }
}

BarChartCard.propTypes = {
    id: PropTypes.string.isRequired,
    chartLabel: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    subjectList: PropTypes.array.isRequired,
    backgroundColor: PropTypes.array
};

export default BarChartCard;

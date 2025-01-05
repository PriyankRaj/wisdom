import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import './Analysis.css'; // Updated CSS for tabs and graphs

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Analysis = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sortedData } = location.state || {};

    const [activeTab, setActiveTab] = useState("hashtags"); // Tabs: 'hashtags' or 'topics'

    // Helper function to aggregate data
    const aggregateData = (key) => {
        return sortedData.reduce((acc, item) => {
            const values = item[key].split(";");
            values.forEach((value) => {
                if (acc[value]) {
                    acc[value].views += item.views;
                    acc[value].frequency += 1;
                } else {
                    acc[value] = { views: item.views, frequency: 1 };
                }
            });
            return acc;
        }, {});
    };

    // Aggregated data for hashtags and topics
    const aggregatedHashtagData = aggregateData("hash_tags");
    const aggregatedTopicData = aggregateData("topics");
    const aggregatedTagData = aggregateData("tags");

    const calculateEffectiveness = (aggregatedData) =>
        Object.entries(aggregatedData).map(([name, { views, frequency }]) => ({
            name,
            views,
            frequency,
            effectiveness: views / frequency,
        }));

    // Processed data for hashtags and topics
    const processedHashtagData = calculateEffectiveness(aggregatedHashtagData);
    const processedTopicData = calculateEffectiveness(aggregatedTopicData);
    const processedTagData = calculateEffectiveness(aggregatedTagData);

    // Sort data and pick top 10 for charts
    const prepareChartData = (data, metric) =>
        data
            .sort((a, b) => b[metric] - a[metric])
            .slice(0, 10);

    const renderChartData = (data, label, color) => ({
        labels: data.map(({ name }) => name),
        datasets: [
            {
                label,
                data: data.map((item) => item[label.toLowerCase()]),
                backgroundColor: color,
                borderColor: color.replace("0.6", "1"),
                borderWidth: 1,
            },
        ],
    });

    const hashtagCharts = {
        views: renderChartData(prepareChartData(processedHashtagData, "views"), "Views", "rgba(75, 192, 192, 0.6)"),
        frequency: renderChartData(prepareChartData(processedHashtagData, "frequency"), "Frequency", "rgba(255, 206, 86, 0.6)"),
        effectiveness: renderChartData(prepareChartData(processedHashtagData, "effectiveness"), "Effectiveness", "rgba(153, 102, 255, 0.6)"),
    };

    const topicCharts = {
        views: renderChartData(prepareChartData(processedTopicData, "views"), "Views", "rgba(75, 192, 192, 0.6)"),
        frequency: renderChartData(prepareChartData(processedTopicData, "frequency"), "Frequency", "rgba(255, 206, 86, 0.6)"),
        effectiveness: renderChartData(prepareChartData(processedTopicData, "effectiveness"), "Effectiveness", "rgba(153, 102, 255, 0.6)"),
    };

    const tagCharts = {
        views: renderChartData(prepareChartData(processedTagData, "views"), "Views", "rgba(75, 192, 192, 0.6)"),
        frequency: renderChartData(prepareChartData(processedTagData, "frequency"), "Frequency", "rgba(255, 206, 86, 0.6)"),
        effectiveness: renderChartData(prepareChartData(processedTagData, "effectiveness"), "Effectiveness", "rgba(153, 102, 255, 0.6)"),
    };

    const chartOptions = {
        indexAxis: "y",
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Value",
                },
                beginAtZero: true,
            },
            y: {
                title: {
                    display: true,
                    text: "Names",
                },
                ticks: {
                    autoSkip: false,
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div className="analysis-container">
            <h1>Data Analysis</h1>
            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === "hashtags" ? "active" : ""}`}
                    onClick={() => setActiveTab("hashtags")}
                >
                    Hashtags Analysis
                </button>
                <button
                    className={`tab-button ${activeTab === "topics" ? "active" : ""}`}
                    onClick={() => setActiveTab("topics")}
                >
                    Topics Analysis
                </button>
                <button
                    className={`tab-button ${activeTab === "tags" ? "active" : ""}`}
                    onClick={() => setActiveTab("tags")}
                >
                    Tags Analysis
                </button>
            </div>
            <div className="chart-container-wrapper">
                {/* Render charts based on active tab */}
                {["views", "frequency", "effectiveness"].map((metric) => (
                    <div className="chart-container" key={`${activeTab}-${metric}`}>
                        <Bar
                            data={
                                activeTab === "hashtags"
                                    ? hashtagCharts[metric]
                                    : activeTab === "topics"
                                        ? topicCharts[metric]
                                        : tagCharts[metric]
                            }
                            options={chartOptions}
                        />
                    </div>
                ))}
            </div>
            <button onClick={() => navigate("/")} style={{padding: "10px 20px", cursor: "pointer"}}>
                Back to Content Table
            </button>
        </div>
    );
};

export default Analysis;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from 'axios';
import './styles/styles.css';
import ContentTable from "./components/ContentTable/ContentTable";
import Analysis from "./components/Analysis/Analysis";

const App = () => {
    const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://ec2-3-110-148-174.ap-south-1.compute.amazonaws.com:5000/api/data');
        //const response = await axios.get('http://ec2-3-110-148-174.ap-south-1.compute.amazonaws.com:5000/api/data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
        <Router>
            <Routes>
                <Route path="/" element={<ContentTable data={data}/>} />
                <Route path="/analysis" element={<Analysis/>} />
            </Routes>
        </Router>
  );
};

export default App;

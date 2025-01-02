import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/styles.css';
import ContentTable from "./components/ContentTable/ContentTable";

const App = () => {
    const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
      <div className="container">

          <div className="layout">
              <div>
                  <ContentTable data={data}/>
              </div>
          </div>
      </div>

  );
};

export default App;

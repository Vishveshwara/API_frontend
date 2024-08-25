import React, { useState } from 'react';
import Select from 'react-select';

function App() {
  const [jsonData, setJsonData] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);

  const filterOptions = [
    { value: 'Alphabets', label: 'Alphabets' },
    { value: 'Numbers', label: 'Numbers' },
    { value: 'Highest lowercase alphabet', label: 'Highest lowercase alphabet' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    let parsedData;
    try {
      parsedData = JSON.parse(jsonData);
      if (!Array.isArray(parsedData.data)) {
        setError('JSON input must contain a "data" array');
        return;
      }
    } catch (err) {
      setError('Invalid JSON format');
      return;
    }

    setError('');

    try {
      const res = await fetch('http://localhost:5000/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      });

      if (!res.ok) {
        throw new Error('Server Error');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    }
  };

  const handleFilterChange = (selectedOptions) => {
    setSelectedFilters(selectedOptions.map(option => option.value));
  };

  const renderFilteredResponse = () => {
    if (!response) return null;

    let filteredResponse = {};

    if (selectedFilters.includes('Alphabets')) {
      filteredResponse.alphabets = response.alphabets;
    }

    if (selectedFilters.includes('Numbers')) {
      filteredResponse.numbers = response.numbers;
    }

    if (selectedFilters.includes('Highest lowercase alphabet')) {
      filteredResponse.highest_lowercase_alphabet = response.alphabets
        ? response.alphabets
            .filter((char) => char === char.toLowerCase())
            .sort()
            .slice(-1)
        : [];
    }

    return (
      <div>
        <h3>Filtered Response:</h3>
        <pre>{JSON.stringify(filteredResponse, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1>Submit JSON Data</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            rows="4"
            cols="50"
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder='Enter JSON data here: { "data": ["M", "1", "33", "4", "B", "z", "A"] }'
            style={styles.textarea}
          />
          <br />
          <button type="submit" style={styles.button}>Submit</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {response && (
          <div>
            <h3>Response:</h3>
            <pre>{JSON.stringify(response, null, 2)}</pre>
            <div>
              <h3>Select Filters:</h3>
              <Select
                isMulti
                options={filterOptions}
                onChange={handleFilterChange}
                placeholder="Select Filters"
              />
            </div>
            {renderFilteredResponse()}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    padding: '20px',
  },
  content: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '600px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    marginTop: '10px',
    padding: '10px 20px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  }
};

export default App;

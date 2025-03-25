import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from 'react';
import api from './api/preds';
import Form from './components/Form';
import FileUpload from './components/FileUpload';
import Results from './components/Results';

function App() {

    const [pred, setPred] = useState([])

    //useEffect(() => {
    //    const getPreds = async () => {
    //        try {
    //            const response = await api.get('/');
    //            setPred(response.data);
    //            console.log(response.data);
    //        } catch (e) {
    //            if (e.response) {
    //                console.log(e.response.data);
    //                console.log(e.response.status);
    //                console.log(e.response.headers);
    //            } else {
    //                console.log(`Error: ${e.message}`)
    //            }
    //        }
    //    }
    //
    //    getPreds();
    //}, [])

    const handleFormSubmit = async (features) => {
        try {
            const response = await api.post('/get_pred', { features_data: features });
            setPred(response.data);
        } catch (error) {
            console.error('Error:', error);
            setPred('An error occurred. Try again.');
        }
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/get_pred_from_file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPred(response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            setPred('An error occurred. Try again.');
        }
    };


    return (
        <div className="App">
            <header className="App-header">
                <h1>Cyberattack Predictor</h1>
                <Form onSubmit={handleFormSubmit} />
                <hr />
                <FileUpload onUpload={handleFileUpload} />
                <hr />
                {pred && <Results result={pred} />}
            </header >
        </div>
    );
}

export default App;

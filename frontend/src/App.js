import './App.css';
import { useState } from 'react';
import api from './api/preds';
import DForm from './components/DForm';
import FileUpload from './components/FileUpload';
import ResultsModal from './components/ResultsModal';
import { Container, Nav, Alert } from 'react-bootstrap';


function App() {

    const [mode, setMode] = useState('single');
    const [pred, setPred] = useState([])
    const [error, setError] = useState('')
    const [showResults, setShowResults] = useState(false);
    const [showError, setShowError] = useState(false);

    let errorMsg = "An unexpected error occurred."

    const handleFormSubmit = async (features) => {

        try {
            const response = await api.post('/get_pred', { features_data: features });
            setPred(response.data);
            setShowResults(true)
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.data && error.response.data.error) {
                errorMsg = error.response.data.error;
            }
            setError(errorMsg);
            setShowError(true);
        }
    };

    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/get_pred_file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPred(response.data);
            setShowResults(true);
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.data && error.response.data.error) {
                errorMsg = error.response.data.error;
            }
            setError(errorMsg);
            setShowError(true)
        }
    };

    return (
        <div className='App'>
            <header className='App-header'>
                <div className='header-title'>
                    <h1>Cyberattack Predictor</h1>
                    <p>Predicts cyberattack TYPE.</p>
                </div>

                <Container className='mt-3 mb-3'>

                    {showError &&
                        <Alert variant='danger' className='mt-4'>{error}</Alert>
                    }

                    <Nav fill variant='tabs' defaultActiveKey='single' className=''>
                        <Nav.Item>
                            <Nav.Link onClick={() => setMode('single')} aria-current='page' eventKey='single'>Single Prediction</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link onClick={() => setMode('file')} eventKey='file-upload'>File Prediction</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {mode === 'single' ? <DForm onSubmit={handleFormSubmit} /> : <FileUpload onUpload={handleFileUpload} />}

                    {showResults && (
                        < ResultsModal
                            show={showResults}
                            results={pred}
                            handleClose={() => {
                                setShowError(false);
                                setShowResults(false);
                                setPred([]);
                            }}
                        />
                    )}
                </Container>
            </header >
        </div >
    );

};

export default App;

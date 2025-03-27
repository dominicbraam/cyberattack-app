import React, { useState, useEffect } from 'react';
import { Accordion, ListGroup, Spinner } from 'react-bootstrap';
import api from '../api/preds';

function CSVGuide() {
    const [formFeaturesData, setFormFeaturesData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFeaturesData = async () => {
            try {
                const response = await api.get('/get_features_data');
                setFormFeaturesData(response.data)
                console.log(response.data)
                setLoading(false);
            } catch (e) {
                console.error(e)
            }
        }
        getFeaturesData();
    }, [])

    if (loading) {
        return (
            <div class='d-flex justify-content-center  align-items-center mt-5'>
                <Spinner animation='border' variant='light' />
            </div>
        );
    };

    return (
        <Accordion defaultActiveKey={null} flush>
            <Accordion.Item eventKey="0">
                <Accordion.Header>CSV File Guide</Accordion.Header>
                <Accordion.Body>
                    <p>Your CSV must include these columns (in any order):</p>
                    <ListGroup variant="flush">
                        {Object.entries(formFeaturesData).map(([column, cfg]) => (
                            <ListGroup.Item key={column}>
                                <strong>{column}</strong> — {cfg.type === 'categorical'
                                    ? `one of: ${cfg.values.join(', ')}`
                                    : `a number between ${cfg.values.min} and ${cfg.values.max}`
                                }.
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

export default CSVGuide;

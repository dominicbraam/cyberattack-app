import React, { useState, useEffect } from 'react';
import { Accordion, ListGroup, Spinner } from 'react-bootstrap';
import api from '../api/preds';

function CSVGuide() {
    /**
     * Instruction component used on file upload page.
     * Generates accordion with all required fields and its constraints if any.
     */
    const [formFeaturesData, setFormFeaturesData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFeaturesData = async () => {
            try {
                const response = await api.get('/get_features_data');
                setFormFeaturesData(response.data);
                console.log(response.data);
                setLoading(false);
            } catch (e) {
                console.error(e);
            }
        }
        getFeaturesData();
    }, [])

    // helper to merge base and additional fields, filtering out derived fields.
    const computeRequiredFields = (data) => {
        const { features_base, features_additional, features_derived } = data;
        // filter out derived fields from the base features.
        const filteredBase = Object.keys(features_base)
            .filter(key => !(features_derived && features_derived.hasOwnProperty(key)))
            .reduce((obj, key) => {
                obj[key] = features_base[key];
                return obj;
            }, {});
        return { ...filteredBase, ...features_additional };
    };

    if (loading) {
        return (
            <div class='d-flex justify-content-center  align-items-center mt-5'>
                <Spinner animation='border' variant='light' />
            </div>
        );
    };

    // filtered fields - no derived
    const requiredFields = computeRequiredFields(formFeaturesData);

    return (
        <Accordion defaultActiveKey={null} flush>
            <Accordion.Item eventKey="0">
                <Accordion.Header>CSV File Guide</Accordion.Header>
                <Accordion.Body>
                    <p>Your CSV must include these columns (in any order):</p>
                    <ListGroup variant="flush">
                        {Object.entries(requiredFields).map(([column, cfg]) => (
                            <ListGroup.Item key={column}>
                                <strong>{column}</strong> — {
                                    (() => {
                                        switch (cfg.type) {
                                            case 'categorical':
                                                return `one of: ${cfg.values.join(', ')}`;
                                            case 'numerical':
                                                return `a number between ${cfg.values.min} and ${cfg.values.max}`;
                                            case 'bool':
                                                return 'either true or false';
                                            case 'datetime':
                                                return 'a valid date and time (YYYY-MM-DDTHH:MM)';
                                            default:
                                                return `${column}`;
                                        }
                                    })()}.
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

export default CSVGuide;

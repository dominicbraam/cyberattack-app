import React, { useState, useEffect } from 'react';
import { Button, Card, FloatingLabel, Form, Row, Spinner } from 'react-bootstrap';
import api from '../api/preds';
import startCase from 'lodash/startCase';

const DForm = ({ onSubmit }) => {
    const [formFeaturesData, setFormFeaturesData] = useState({});
    const [requiredFields, setRequiredFields] = useState({});
    const [userInput, setUserInput] = useState({});
    const [loading, setLoading] = useState(true);
    const [predictionLoading, setPredictionLoading] = useState(false);

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

    // helper to merge base and additional fields, filtering out derived fields.
    const computeRequiredFields = (data) => {
        const { features_base, features_additional, features_derived } = data;
        // Filter out derived fields from the base features.
        const filteredBase = Object.keys(features_base)
            .filter(key => !(features_derived && features_derived.hasOwnProperty(key)))
            .reduce((obj, key) => {
                obj[key] = features_base[key];
                return obj;
            }, {});
        return { ...filteredBase, ...features_additional };
    };

    // compute and store requiredFields and default userInput once the formFeaturesData loads.
    useEffect(() => {
        if (Object.keys(formFeaturesData).length > 0) {
            const fields = computeRequiredFields(formFeaturesData);
            setRequiredFields(fields);
            const defaults = {};
            Object.entries(fields).forEach(([name, data]) => {
                if (data.type === 'bool') {
                    defaults[name] = false;
                }
            });
            setUserInput(defaults);
        }
    }, [formFeaturesData]);

    const groupedFields = Object.entries(requiredFields).reduce((acc, [name, config]) => {
        const type = config.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push({ name, config });
        return acc;
    }, {});
    const groupOrder = ['categorical', 'text', 'numerical', 'datetime', 'bool'];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserInput((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitted form data:', userInput);
        setPredictionLoading(true);
        try {
            await onSubmit(userInput);
        } catch (error) {
            console.error(error);
        } finally {
            setPredictionLoading(false);
        }
    };

    const renderField = (name, data) => {
        switch (data.type) {
            case 'text':
                return (
                    <Form.Control
                        type='text'
                        name={name}
                        id={name}
                        value={userInput[name]}
                        onChange={handleChange}
                        placeholder=''
                    />
                );
            case 'numerical':
                return (
                    <Form.Control
                        type='number'
                        name={name}
                        id={name}
                        value={userInput[name]}
                        onChange={handleChange}
                        min={data.min}
                        max={data.max}
                        placeholder=''
                    />
                );
            case 'bool':
                return (
                    <Form.Check
                        type='checkbox'
                        id={name}
                        name={name}
                        label={humanizeField(name)}
                        checked={userInput[name]}
                        onChange={handleChange}
                    />
                );
            case 'categorical':
                return (
                    <Form.Select id={name} name={name} value={userInput[name]} onChange={handleChange}>
                        <option value=''>Select an option</option>
                        {data.values.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </Form.Select>
                );
            case 'datetime':
                return (
                    <Form.Control
                        type='datetime-local'
                        name={name}
                        id={name}
                        value={userInput[name]}
                        onChange={handleChange}
                    />
                );
            default:
                return null;
        }
    };

    const humanizeField = (fieldName) => {
        const abbreviations = ['IP', 'OS'];
        const formatted = startCase(fieldName);
        return formatted.split(' ').map(word =>
            abbreviations.includes(word.toUpperCase()) ? word.toUpperCase() : word
        ).join(' ');
    };

    if (loading) {
        return (
            <div class='d-flex justify-content-center  align-items-center mt-5'>
                <Spinner animation='border' variant='light' />
            </div>
        );
    };

    return (
        <Card className='mb-4 shadow-sm rounded-0 p-3'>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row className='g-2'>
                        {groupOrder.map(type => {
                            if (!groupedFields[type]) return null;
                            return (
                                <>
                                    {groupedFields[type].map(({ name, config }) => {
                                        if (config.type === 'bool') {
                                            return (
                                                <div key={name} className="col-md-3 mt-3 text-start">
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={name}
                                                        name={name}
                                                        label={humanizeField(name)}
                                                        checked={userInput[name]}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <FloatingLabel key={name} htmlFor={name} label={humanizeField(name)} className='col-md-3 mt-3'>
                                                    {renderField(name, config)}
                                                </FloatingLabel>
                                            );
                                        }
                                    })}
                                </>
                            );
                        })}

                        <Button type='submit' size='lg' className='btn-action mt-4' disabled={predictionLoading}>
                            {predictionLoading ? <Spinner animation="border" size="sm" /> : 'Get Prediction'}
                        </Button>
                    </Row>
                </Form>
            </Card.Body >
        </Card >
    );
};

export default DForm;

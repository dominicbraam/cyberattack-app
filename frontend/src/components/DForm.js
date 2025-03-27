import React, { useState, useEffect } from 'react';
import api from '../api/preds';

import { Button, Card, FloatingLabel, Form, Row, Spinner } from 'react-bootstrap';

const DForm = ({ onSubmit }) => {
    const [formFeaturesData, setFormFeaturesData] = useState({});
    const [userInput, setUserInput] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFeaturesData = async () => {
            try {
                const response = await api.get('/get_features_data');
                setFormFeaturesData(response.data)
                console.log(response.data)
                setLoading(false);
            } catch (e) {
                if (e.response) {
                    console.log(e.response.data);
                    console.log(e.response.status);
                    console.log(e.response.headers);
                } else {
                    console.log(`Error: ${e.message}`)
                }
            }
        }
        getFeaturesData();
    }, [])


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserInput((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitted form data:', userInput);
        onSubmit(userInput);
    };

    const renderField = (name, data) => {
        switch (data.type) {
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
                    <Form.Control
                        className='form-check-input'
                        type='checkbox'
                        id={name}
                        name={name}
                        checked={userInput[name]}
                        onChange={handleChange}
                        placeholder=''
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
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div class='d-flex justify-content-center mt-5'>
                <Spinner animation='border' variant='secondary' />
            </div>
        );
    };

    return (
        <Card className='mb-4 shadow-sm rounded-0 p-3'>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row className='g-2'>
                        {Object.entries(formFeaturesData).map(([name, config]) => (
                            <FloatingLabel for={name} label={name} className='col-md-3 mt-3'>
                                {renderField(name, config)}
                            </FloatingLabel>
                        ))}

                        <Button type='submit' size='lg' className='btn-action mt-4'>
                            Get Prediction
                        </Button>
                    </Row>
                </Form>
            </Card.Body >
        </Card >
    );
};

export default DForm;

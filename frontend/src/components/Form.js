import React, { useState } from 'react';

function Form({ onSubmit }) {
    const [features, setFeatures] = useState({
        browser: '',
        os: '',
        pckt_len_pckt_tp: '',
        pckt_len_Source: '',
        pckt_tp_Protocol: '',
        anomaly_scores: '',
        month: '',
    });

    const browser_options = ['IE', 'Firefox', 'Chrome'];
    const os_options = ['Linux', 'Android', 'Windows'];
    const pckt_len_pckt_tp_options = ['Medium_Control', 'Large_Data', 'Small_Control'];
    const pckt_len_Source_options = ['Medium_Firewall', 'Small_Firewall', 'Large_Firewall'];
    const pckt_tp_Protocol_options = ['Control_TCP', 'Data_TCP', 'Control_UDP'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeatures({ ...features, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate and convert the numeric fields
        //const floatVal = parseFloat(features.floatItem);
        //const intVal = parseInt(features.intItem, 10);

        //if (isNaN(floatVal)) {
        //    alert('Please enter a valid float value.');
        //    return;
        //}
        //if (isNaN(intVal)) {
        //    alert('Please enter a valid integer value.');
        //    return;
        //}

        const dataToSubmit = {
            ...features,
            //floatItem: floatVal,
            //intItem: intVal,
        };

        onSubmit(dataToSubmit);

        setFeatures({
            browser: '',
            os: '',
            pckt_len_pckt_tp: '',
            pckt_len_Source: '',
            pckt_tp_Protocol: '',
            anomaly_scores: '',
            month: '',
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Browser:
                    <select
                        name="browser"
                        value={features.browser}
                        onChange={handleChange}
                    >
                        <option value="">Select an option</option>
                        {browser_options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div>
                <label>
                    OS:
                    <select
                        name="os"
                        value={features.os}
                        onChange={handleChange}
                    >
                        <option value="">Select an option</option>
                        {os_options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div>
                <label>
                    pckt_len_pckt_tp:
                    <select
                        name="pckt_len_pckt_tp"
                        value={features.pckt_len_pckt_tp}
                        onChange={handleChange}
                    >
                        <option value="">Select an option</option>
                        {pckt_len_pckt_tp_options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div>
                <label>
                    pckt_len_Source:
                    <select
                        name="pckt_len_Source"
                        value={features.pckt_len_Source}
                        onChange={handleChange}
                    >
                        <option value="">Select an option</option>
                        {pckt_len_Source_options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div>
                <label>
                    pckt_tp_Protocol:
                    <select
                        name="pckt_tp_Protocol"
                        value={features.pckt_tp_Protocol}
                        onChange={handleChange}
                    >
                        <option value="">Select an option</option>
                        {pckt_tp_Protocol_options.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div>
                <label>
                    anomaly_scores:
                    <input
                        type="number"
                        step="any"
                        name="anomaly_scores"
                        value={features.anomaly_scores}
                        onChange={handleChange}
                        placeholder="Anomaly Score"
                    />
                </label>
            </div>

            <div>
                <label>
                    month:
                    <input
                        type="number"
                        step="1"
                        name="month"
                        value={features.month}
                        onChange={handleChange}
                        placeholder="Enter month..."
                    />
                </label>
            </div>

            <button type="submit">Submit</button>
        </form>);
}

export default Form;

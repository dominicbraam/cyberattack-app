import React from 'react';

function FileUpload({ onUpload }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div>
            <label>
                File:
                <input type="file" onChange={handleFileChange} />
            </label>
        </div>
    );
}

export default FileUpload;

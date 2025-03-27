import React, { useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { BsCloudUpload } from 'react-icons/bs';
import CSVGuide from './CSVGuide';

function FileUpload({ onUpload }) {

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    return (
        <>
            <Card className="mb-4 rounded-0" style={{ border: '2px dashed #ccc' }}>
                <Card.Body
                    className="text-center p-5"
                    {...getRootProps()}
                    style={{ cursor: 'pointer' }}
                >
                    <input {...getInputProps()} />
                    <BsCloudUpload size={50} className="text-secondary mb-3" />
                    <Card.Title>Upload Your CSV</Card.Title>
                    <Card.Text className="mb-4">
                        {isDragActive
                            ? "Drop the CSV file here..."
                            : "Drag & drop your CSV file here, or click to browse."}
                    </Card.Text>
                </Card.Body>
            </Card>
            <CSVGuide />
        </>
    );
}

export default FileUpload;

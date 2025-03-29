import React, { useCallback, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { BsCloudUpload } from 'react-icons/bs';
import CSVGuide from './CSVGuide';

function FileUpload({ onUpload }) {
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setLoading(true);
            Promise.resolve(onUpload(acceptedFiles[0])).finally(() => {
                setLoading(false);
            });
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    return (
        <>
            <Card className='mb-4 rounded-0' style={{ border: '2px dashed #ccc' }}>
                <Card.Body
                    className='text-center p-5'
                    {...getRootProps()}
                    style={{ cursor: 'pointer' }}
                >
                    <input {...getInputProps()} />
                    {loading ? (
                        <Spinner animation='border' variant='dark' size='lg' />
                    ) : (
                        <>
                            <BsCloudUpload size={50} className='text-secondary mb-3' />
                            <Card.Title>Upload Your CSV</Card.Title>
                            <Card.Text className='mb-4'>
                                {isDragActive
                                    ? 'Drop the CSV file here...'
                                    : 'Drag & drop your CSV file here, or click to browse.'}
                            </Card.Text>
                        </>
                    )}
                </Card.Body>
            </Card>
            <CSVGuide />
        </>
    );
}

export default FileUpload;

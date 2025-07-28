// components/Layouts/steps/confirmation-step.tsx
'use client';
import { useState } from 'react';

export function ConfirmationStep({
    data,
    selectedRows,
    mappings,
    onBack,
    onComplete
}: {
    data: any[];
    selectedRows: number[];
    mappings: Record<string, string>;
    onBack: () => void;
    onComplete: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadResult, setUploadResult] = useState<{
        success: boolean;
        message: string;
        details?: string;
    } | null>(null);    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Filter selected data
            const selectedData = selectedRows.map(index => data[index]);
            console.log('Selected data:', selectedData);

            // First, map the data using the CSV mapper
            const mapResponse = await fetch('/api/csv-mapper', {
                method: 'POST',
                body: JSON.stringify({ data: selectedData, action: 'map' }),
                headers: { 'Content-Type': 'application/json' }
            });
            const mapResult = await mapResponse.json();

            if (!mapResult.success) {
                throw new Error(mapResult.message || 'Failed to map data');
            }

            // If there are mapping errors, show them
            if (mapResult.errors.length > 0) {
                console.warn('Mapping errors:', mapResult.errors);
            }

            // Upload the mapped data
            const payload = mapResult.mapped;
            console.log('Payload to upload:', payload);

            const response = await fetch('/api/koi', {
                method: 'POST',
                body: JSON.stringify({ payload }),
                headers: { 'Content-Type': 'application/json' }
            });
            const result = await response.json();            
            
            if (result.error) {
                setUploadResult({
                    success: false,
                    message: result.message,
                    details: result.error
                });
            }
            else {
                const successCount = mapResult.summary.success;
                const errorCount = mapResult.errors.length;
                const message = errorCount > 0 
                    ? `Successfully uploaded ${successCount} koi records. ${errorCount} records had mapping errors.`
                    : `Successfully uploaded ${successCount} koi records`;
                
                setUploadResult({
                    success: true,
                    message,
                    details: errorCount > 0 ? `Mapping errors: ${mapResult.errors.map(e => e.error).join(', ')}` : undefined
                });
                onComplete();
            }


        } catch (error) {
            setUploadResult({
                success: false,
                message: 'Upload failed. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">

            {uploadResult ? (
                <div className={`p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    <p className="font-medium">{uploadResult.message}</p>
                    {uploadResult.details && (
                        <p className="text-sm mt-2">{uploadResult.details}</p>
                    )}
                    {uploadResult.success && (
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-primary hover:underline"
                        >
                            Upload more koi
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Upload Summary</h3>
                        <p>• Records to upload: {selectedRows.length}</p>
                        <p>• Mapped fields: {Object.values(mappings).join(', ')}</p>
                    </div>


                </>
            )}
            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="btn-secondary"
                    disabled={isSubmitting}
                >
                    Back
                </button>

                {(!uploadResult && (<button
                    type="button"
                    onClick={handleSubmit}
                    className="btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Uploading...' : 'Confirm Upload'}
                </button>))}
            </div>
        </div>
    );
}
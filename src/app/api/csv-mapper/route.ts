import { NextRequest } from 'next/server';
import { createCSVMapper, InputRow } from '@/utils/csv-mapper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, action = 'validate' } = body;

    if (!data || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid data format. Expected array of rows.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize CSV mapper
    const mapper = await createCSVMapper();    
    
    if (action === 'validate') {
      // Add debugging
      console.log('Received data for validation:', {
        dataLength: data.length,
        firstRow: data[0],
        headers: data[0] ? Object.keys(data[0]) : []
      });
      
      // Validate the data and return report
      const validation = await mapper.validateRows(data as InputRow[]);
      
      // console.log('Validation result:', validation);
      
      return new Response(
        JSON.stringify({
          success: true,
          validation,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    if (action === 'map') {
      // Map the data to database format
      const result = await mapper.mapRows(data as InputRow[]);
      
      return new Response(
        JSON.stringify({
          success: true,
          mapped: result.success,
          errors: result.errors,
          summary: {
            total: data.length,
            success: result.success.length,
            failed: result.errors.length,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid action. Use "validate" or "map".',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('CSV mapping error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

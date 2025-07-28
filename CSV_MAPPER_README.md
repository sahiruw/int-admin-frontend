# CSV Mapper for Bulk Upload

This document explains the CSV mapping functionality that transforms input CSV files from the client's format to the database format.

## Overview

The CSV Mapper automatically converts the client's input format to the database format, handling:
- Field mapping and transformation
- Lookup table resolution (breeders, varieties)
- Automatic creation of customers and shipping locations
- Commission and exchange rate application
- Data validation and error reporting

## Input Format

The expected CSV input format matches the client's original spreadsheet structure:

```csv
Picture ID,Koi ID,Variety,Sex,Age,Size CM,Bre-ID,Breeder,PCS,JPY Cost,JPY Total,USD Cost,USD Total,Sold to,Ship to,Sales,Comm,Total,Sales ,Comm ,Total 
v1019n015,10,Kohaku,m,22,55,19,Hoshikin Koi Farm,1,280000,"280,000","2,000.00","2,000.00",Summer,Japan,"333,333","66,667","400,000",,,
```

### Required Fields
- **Picture ID**: Unique identifier for the koi (must be present)
- **Variety**: Koi variety name (must match database varieties)
- **Bre-ID** or **Breeder**: Breeder identifier or name
- **Age**: Age in years
- **Size CM**: Size in centimeters
- **PCS**: Number of pieces

### Optional Fields
- **Sex**: Gender (m/f/u), defaults to 'm'
- **JPY Cost**: Cost in Japanese Yen
- **Sold to**: Customer name (will be created if not exists)
- **Ship to**: Shipping location (will be created if not exists)
- **Sales**: Sales price in JPY (in "Sales" column)
- **Comm**: Commission in JPY
- USD sales data (in rightmost columns)

## Database Format

The mapper transforms input data to this database format:

```typescript
{
  picture_id: string;
  koi_id: number;           // Mapped from variety name
  sex: string;              // 'm', 'f', or 'u'
  age: number;
  size_cm: string;
  breeder_id: number;       // Mapped from breeder ID/name
  pcs: number;
  jpy_cost: number;
  customer_id: number | null;    // Created if not exists
  ship_to: number | null;        // Created if not exists
  sale_price_jpy: number | null;
  sale_price_usd: number | null;
  comm: number;             // Commission rate (decimal)
  rate: number;             // Exchange rate from config
  timestamp: string;        // Current timestamp
}
```

## Mapping Logic

### 1. Variety Mapping
- Tries to match by variety ID first
- Falls back to fuzzy name matching (case-insensitive, partial match)
- **Validation**: Row is rejected if variety cannot be found

### 2. Breeder Mapping
- Tries to match by breeder ID first
- Falls back to exact name matching (case-insensitive)
- **Validation**: Row is rejected if breeder cannot be found

### 3. Customer Mapping
- Searches for existing customers by name (case-insensitive)
- **Auto-creates** new customers if not found
- Returns null for empty customer names

### 4. Shipping Location Mapping
- Searches for existing locations by name (case-insensitive)
- **Auto-creates** new locations if not found
- Returns null for empty location names

### 5. Sales Price Calculation
- Prioritizes JPY sales data from "Sales" column
- Falls back to USD sales data from rightmost columns
- Calculates commission rate from sales and commission amounts
- Uses default commission rate from configuration if not calculable

### 6. Configuration Application
- Applies exchange rate from configuration table
- Uses default commission rate if not specified in data
- Adds current timestamp to all records

## API Endpoints

### `/api/csv-mapper` (POST)

Validates or maps CSV data.

**Request Body:**
```json
{
  "data": [...],          // Array of CSV row objects
  "action": "validate"    // "validate" or "map"
}
```

**Validation Response:**
```json
{
  "success": true,
  "validation": {
    "valid": 45,
    "invalid": [
      {
        "row": 3,
        "issues": ["Unknown variety: Kohaku XL", "Missing breeder"],
        "data": {...}
      }
    ],
    "missingEntities": {
      "breeders": ["Unknown Breeder Farm"],
      "varieties": ["Kohaku XL", "Special Variety"]
    }
  }
}
```

**Mapping Response:**
```json
{
  "success": true,
  "mapped": [...],        // Successfully mapped records
  "errors": [             // Failed mappings
    {
      "row": 3,
      "error": "Unknown variety",
      "data": {...}
    }
  ],
  "summary": {
    "total": 50,
    "success": 45,
    "failed": 5
  }
}
```

## Bulk Upload Wizard

The bulk upload wizard provides a 4-step process:

### 1. Upload CSV
- Drag and drop or click to upload
- Validates CSV format and structure
- Filters rows without Picture ID

### 2. Validate Data
- Runs validation against database
- Shows validation summary with counts
- Highlights missing entities and invalid records
- Displays actionable error messages

### 3. Review Data
- Shows only valid records for review
- Allows selection/deselection of records to import
- Pre-selects all valid rows
- Hides invalid rows from previous step

### 4. Confirmation
- Maps selected data to database format
- Uploads to `/api/koi` endpoint
- Shows success/failure results
- Provides detailed error information

## Error Handling

### Validation Errors
- **Missing Picture ID**: Row skipped
- **Unknown Variety**: Row rejected, variety listed in missing entities
- **Unknown Breeder**: Row rejected, breeder listed in missing entities
- **Invalid Data Types**: Age, PCS, costs must be numeric

### Mapping Errors
- **Database Connection**: Fails gracefully with error message
- **Lookup Failures**: Individual rows fail, others continue
- **Creation Failures**: Customer/location creation failures logged as warnings

### Upload Errors
- **Partial Success**: Shows count of successful vs failed uploads
- **Complete Failure**: Shows error message and allows retry
- **Validation Issues**: Pre-upload validation prevents bad data

## Configuration Requirements

### Database Tables
- `breeder`: id, name
- `variety`: id, variety
- `customer`: id, name
- `shippinglocation`: id, name
- `configuration`: ex_rate, commission

### Required Configuration
- Exchange rate (USD to JPY)
- Default commission rate (decimal, e.g., 0.2 for 20%)

## Usage Examples

### Basic Upload
1. Export client spreadsheet as CSV
2. Navigate to Koi → Bulk Add
3. Upload CSV file
4. Review validation results
5. Select records to import
6. Confirm upload

### Handling Missing Data
- **Missing Varieties**: Add to varieties table first, then re-upload
- **Missing Breeders**: Add to breeders table first, then re-upload
- **Missing Customers**: Will be created automatically
- **Missing Locations**: Will be created automatically

### Data Quality Tips
- Ensure variety names match database exactly
- Use consistent breeder names or IDs
- Verify exchange rates are current
- Review commission calculations
- Check for duplicate Picture IDs

## Troubleshooting

### Common Issues
1. **"Unknown variety"**: Variety name doesn't match database
   - Solution: Add variety to database or fix name in CSV

2. **"Unknown breeder"**: Breeder ID/name doesn't match database
   - Solution: Add breeder to database or fix ID/name in CSV

3. **"Invalid numeric format"**: Non-numeric data in numeric fields
   - Solution: Clean data in CSV, remove formatting

4. **"Mapping failed"**: Database connection or constraint issues
   - Solution: Check database connectivity and constraints

### Performance Notes
- Large files (>1000 rows) may take longer to validate
- Customer/location creation adds processing time
- Validation caches lookup tables for performance

## Security

- Validates all input data before processing
- Prevents SQL injection through parameterized queries
- Checks user permissions before upload
- Logs all creation activities for audit

## Future Enhancements

- Support for additional CSV formats
- Batch operations for missing entities
- Progress indicators for large uploads
- Export validation reports
- Undo functionality for uploads

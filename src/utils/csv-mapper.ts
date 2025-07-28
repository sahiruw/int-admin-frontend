import { createClient } from "@/utils/supabase/supabase";

export interface InputRow {
  'Picture ID': string;
  'Koi ID': string;
  'Variety': string;
  'Sex': string;
  'Age': string;
  'Size CM': string;
  'Bre-ID': string;
  'Breeder': string;
  'PCS': string;
  'JPY Cost': string;
  'JPY Total': string;
  'USD Cost': string;
  'USD Total': string;
  'Sold to': string;
  'Ship to': string;
  'Sales': string;
  'Comm': string;
  'Total': string;
  'Sales ': string; // Extra space variant
  'Comm ': string;  // Extra space variant  
  'Total ': string; // Extra space variant
  [key: string]: string; // Allow for additional columns
}

export interface DatabaseRow {
  picture_id: string;
  koi_id: number;
  sex: string;
  age: number;
  size_cm: string;
  breeder_id: number;
  pcs: number;
  jpy_cost: number;
  customer_id: number | null;
  ship_to: number | null;
  sale_price_jpy: number | null;
  sale_price_usd: number | null;
  comm: number;
  rate: number;
  timestamp: string;
}

export interface LookupTables {
  breeders: Array<{ id: number; name: string }>;
  varieties: Array<{ id: number; variety: string }>;
  customers: Array<{ id: number; name: string }>;
  locations: Array<{ id: number; name: string }>;
  configuration: {
    ex_rate: number;
    commission: number;
  };
}

export class CSVMapper {
  private lookupTables: LookupTables | null = null;

  /**
   * Safely get a value from a row, handling different column name variations
   */
  private getRowValue(row: InputRow, ...columnNames: string[]): string {
    for (const colName of columnNames) {
      if (row[colName] !== undefined && row[colName] !== null) {
        return String(row[colName]).trim();
      }
    }
    return '';
  }

  /**
   * Initialize lookup tables from database
   */
  async initializeLookupTables(): Promise<void> {
    const supabaseClient = await createClient();

    try {      // Fetch all lookup data in parallel
      const [breedersRes, varietiesRes, customersRes, locationsRes, configRes] = await Promise.all([
        supabaseClient.from("breeder").select("id, name"),
        supabaseClient.from("variety").select("id, variety"),
        supabaseClient.from("customer").select("id, name"),
        supabaseClient.from("shippinglocation").select("id, name"),
        supabaseClient.from("configuration").select("ex_rate, commission").limit(1)
      ]);

      // Check for errors
      if (breedersRes.error) throw new Error(`Breeders: ${breedersRes.error.message}`);
      if (varietiesRes.error) throw new Error(`Varieties: ${varietiesRes.error.message}`);
      if (customersRes.error) throw new Error(`Customers: ${customersRes.error.message}`);
      if (locationsRes.error) throw new Error(`Locations: ${locationsRes.error.message}`);
      if (configRes.error) throw new Error(`Configuration: ${configRes.error.message}`);

      // Handle configuration - use first row if available, otherwise use defaults
      const configData = configRes.data && configRes.data.length > 0 
        ? configRes.data[0] 
        : { ex_rate: 140, commission: 0.2 };

      this.lookupTables = {
        breeders: breedersRes.data || [],
        varieties: varietiesRes.data || [],
        customers: customersRes.data || [],
        locations: locationsRes.data || [],
        configuration: configData
      };
    } catch (error) {
      throw new Error(`Failed to initialize lookup tables: ${error}`);
    }
  }

  /**
   * Find breeder by ID or name
   */
  private findBreeder(identifier: string): number | null {
    if (!this.lookupTables) throw new Error("Lookup tables not initialized");

    // Try by ID first
    const byId = this.lookupTables.breeders.find(b => b.id.toString() === identifier);
    if (byId) return byId.id;

    // Try by name (case insensitive)
    const byName = this.lookupTables.breeders.find(b => 
      b.name.toLowerCase() === identifier.toLowerCase()
    );
    return byName ? byName.id : null;
  }

  /**
   * Find variety by ID or name
   */
  private findVariety(identifier: string): number | null {
    if (!this.lookupTables) throw new Error("Lookup tables not initialized");

    // Try by ID first
    const byId = this.lookupTables.varieties.find(v => v.id.toString() === identifier);
    if (byId) return byId.id;

    // Try by name (case insensitive, fuzzy matching)
    const cleanIdentifier = identifier.toLowerCase().trim();
    const byName = this.lookupTables.varieties.find(v => 
      v.variety.toLowerCase().includes(cleanIdentifier) || 
      cleanIdentifier.includes(v.variety.toLowerCase())
    );
    return byName ? byName.id : null;
  }

  /**
   * Find customer by name (creates if not found)
   */
  private async findOrCreateCustomer(name: string): Promise<number | null> {
    if (!this.lookupTables || !name) return null;

    // Try to find existing customer
    const existing = this.lookupTables.customers.find(c => 
      c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.id;    // Create new customer
    try {
      const supabaseClient = await createClient();
      const { data, error } = await supabaseClient
        .from("customer")
        .insert({ name })
        .select("id")
        .single();

      if (error) throw error;

      // Add to local cache
      this.lookupTables.customers.push({ id: data.id, name });
      return data.id;
    } catch (error) {
      console.warn(`Failed to create customer "${name}":`, error);
      return null;
    }
  }

  /**
   * Find shipping location by name (creates if not found)
   */
  private async findOrCreateLocation(name: string): Promise<number | null> {
    if (!this.lookupTables || !name) return null;

    // Try to find existing location
    const existing = this.lookupTables.locations.find(l => 
      l.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.id;    // Create new location
    try {
      const supabaseClient = await createClient();
      const { data, error } = await supabaseClient
        .from("shippinglocation")
        .insert({ name })
        .select("id")
        .single();

      if (error) throw error;

      // Add to local cache
      this.lookupTables.locations.push({ id: data.id, name });
      return data.id;
    } catch (error) {
      console.warn(`Failed to create location "${name}":`, error);
      return null;
    }
  }

  /**
   * Parse numeric value from string (handles commas, currencies)
   */
  private parseNumeric(value: string): number {
    if (!value || value.trim() === '') return 0;
    
    // Remove commas, currency symbols, and whitespace
    const cleaned = value.toString()
      .replace(/[,$¥\s]/g, '')
      .replace(/[^\d.-]/g, '');
    
    return parseFloat(cleaned) || 0;
  }

  /**
   * Calculate sales prices and commission from input
   */  private calculateSales(row: InputRow): { 
    sale_price_jpy: number | null; 
    sale_price_usd: number | null; 
    comm: number 
  } {
    if (!this.lookupTables) throw new Error("Configuration not loaded");

    const salesJpy = this.parseNumeric(this.getRowValue(row, 'Sales', 'sales'));
    const commJpy = this.parseNumeric(this.getRowValue(row, 'Comm', 'comm'));
    const totalJpy = this.parseNumeric(this.getRowValue(row, 'Total', 'total'));

    // If we have sales data in JPY
    if (salesJpy > 0) {
      return {
        sale_price_jpy: salesJpy,
        sale_price_usd: null,
        comm: commJpy > 0 ? commJpy / salesJpy : this.lookupTables.configuration.commission
      };
    }

    // Check for USD sales data in the rightmost columns with spaces
    const salesUsd = this.parseNumeric(this.getRowValue(row, 'Sales ', 'Sales.1', 'sales_usd'));
    const commUsd = this.parseNumeric(this.getRowValue(row, 'Comm ', 'Comm.1', 'comm_usd'));

    if (salesUsd > 0) {
      return {
        sale_price_jpy: null,
        sale_price_usd: salesUsd,
        comm: commUsd > 0 ? commUsd / salesUsd : this.lookupTables.configuration.commission
      };
    }

    // No sales data
    return {
      sale_price_jpy: null,
      sale_price_usd: null,
      comm: this.lookupTables.configuration.commission
    };
  }

  /**
   * Map a single input row to database format
   */  async mapRow(row: InputRow): Promise<DatabaseRow | null> {
    if (!this.lookupTables) {
      throw new Error("Lookup tables not initialized. Call initializeLookupTables() first.");
    }

    try {
      // Required fields validation using helper
      const pictureId = this.getRowValue(row, 'Picture ID', 'picture_id', 'PictureID');
      if (!pictureId) {
        console.warn('Skipping row: Missing Picture ID');
        return null;
      }

      // Find variety ID
      const variety = this.getRowValue(row, 'Variety', 'variety');
      const varietyId = this.findVariety(variety);
      if (!varietyId) {
        console.warn(`Skipping row ${pictureId}: Unknown variety "${variety}"`);
        return null;
      }

      // Find breeder ID
      const breederId = this.getRowValue(row, 'Bre-ID', 'breeder_id');
      const breederName = this.getRowValue(row, 'Breeder', 'breeder');
      const breederFound = this.findBreeder(breederId || breederName);
      if (!breederFound) {
        console.warn(`Skipping row ${pictureId}: Unknown breeder "${breederId} - ${breederName}"`);
        return null;
      }

      // Find or create customer and location
      const soldTo = this.getRowValue(row, 'Sold to', 'sold_to', 'customer');
      const shipTo = this.getRowValue(row, 'Ship to', 'ship_to', 'location');
      const customerId = await this.findOrCreateCustomer(soldTo);
      const locationId = await this.findOrCreateLocation(shipTo);

      // Calculate sales and commission
      const salesData = this.calculateSales(row);

      // Build database row
      const dbRow: DatabaseRow = {
        picture_id: pictureId,
        koi_id: varietyId,
        sex: (this.getRowValue(row, 'Sex', 'sex') || 'm').toLowerCase().charAt(0),
        age: parseInt(this.getRowValue(row, 'Age', 'age') || '0') || 0,
        size_cm: this.getRowValue(row, 'Size CM', 'size_cm', 'size') || '0',
        breeder_id: breederFound,
        pcs: parseInt(this.getRowValue(row, 'PCS', 'pcs') || '1') || 1,
        jpy_cost: this.parseNumeric(this.getRowValue(row, 'JPY Cost', 'jpy_cost') || '0'),
        customer_id: customerId,
        ship_to: locationId,
        sale_price_jpy: salesData.sale_price_jpy,
        sale_price_usd: salesData.sale_price_usd,
        comm: salesData.comm,
        rate: this.lookupTables.configuration.ex_rate,
        timestamp: new Date().toISOString()
      };

      return dbRow;
    } catch (error) {
      console.error(`Error mapping row ${this.getRowValue(row, 'Picture ID')}:`, error);
      return null;
    }
  }

  /**
   * Map multiple rows
   */
  async mapRows(rows: InputRow[]): Promise<{
    success: DatabaseRow[];
    errors: Array<{ row: number; error: string; data: InputRow }>;
  }> {
    const success: DatabaseRow[] = [];
    const errors: Array<{ row: number; error: string; data: InputRow }> = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const mapped = await this.mapRow(rows[i]);
        if (mapped) {
          success.push(mapped);
        } else {
          errors.push({
            row: i + 1,
            error: 'Failed to map row',
            data: rows[i]
          });
        }
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: rows[i]
        });
      }
    }

    return { success, errors };
  }

  /**
   * Get validation report for input data
   */  async validateRows(rows: InputRow[]): Promise<{
    valid: number;
    invalid: Array<{ row: number; issues: string[]; data: InputRow }>;
    missingEntities: {
      breeders: string[];
      varieties: string[];
    };
  }> {
    if (!this.lookupTables) {
      throw new Error("Lookup tables not initialized");
    }

    console.log('Starting validation of', rows.length, 'rows');
    console.log('First row:', rows[0]);
    console.log('Available breeders:', this.lookupTables.breeders.length);
    console.log('Available varieties:', this.lookupTables.varieties.length);

    const invalid: Array<{ row: number; issues: string[]; data: InputRow }> = [];
    const missingBreeders = new Set<string>();
    const missingVarieties = new Set<string>();
    let valid = 0;    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const issues: string[] = [];

      console.log(`Validating row ${i + 1}:`, row);

      // Check required fields using helper method
      const pictureId = this.getRowValue(row, 'Picture ID', 'picture_id', 'PictureID');
      if (!pictureId) {
        issues.push('Missing Picture ID');
        console.log(`Row ${i + 1}: Missing Picture ID`);
      }

      const variety = this.getRowValue(row, 'Variety', 'variety');
      if (!variety) {
        issues.push('Missing Variety');
        console.log(`Row ${i + 1}: Missing Variety`);
      } else {
        const varietyFound = this.findVariety(variety);
        if (!varietyFound) {
          issues.push(`Unknown variety: ${variety}`);
          missingVarieties.add(variety);
          console.log(`Row ${i + 1}: Unknown variety "${variety}"`);
        } else {
          console.log(`Row ${i + 1}: Found variety "${variety}" -> ID ${varietyFound}`);
        }
      }      const breederId = this.getRowValue(row, 'Bre-ID', 'breeder_id');
      const breederName = this.getRowValue(row, 'Breeder', 'breeder');
      
      if (!breederId && !breederName) {
        issues.push('Missing Breeder ID and Breeder name');
      } else {
        const breederFound = this.findBreeder(breederId || breederName);
        if (!breederFound) {
          issues.push(`Unknown breeder: ${breederId} - ${breederName}`);
          missingBreeders.add(`${breederId} - ${breederName}`);
        }
      }

      // Check numeric fields
      const age = this.getRowValue(row, 'Age', 'age');
      if (age && isNaN(parseInt(age))) {
        issues.push('Invalid age format');
      }

      const pcs = this.getRowValue(row, 'PCS', 'pcs');
      if (pcs && isNaN(parseInt(pcs))) {
        issues.push('Invalid PCS format');
      }

      const jpyCost = this.getRowValue(row, 'JPY Cost', 'jpy_cost');
      if (jpyCost && isNaN(this.parseNumeric(jpyCost))) {
        issues.push('Invalid JPY Cost format');
      }

      if (issues.length > 0) {
        invalid.push({ row: i + 1, issues, data: row });
      } else {
        valid++;
      }
    }

    return {
      valid,
      invalid,
      missingEntities: {
        breeders: Array.from(missingBreeders),
        varieties: Array.from(missingVarieties)
      }
    };
  }
}

/**
 * Utility function to create and initialize a CSV mapper
 */
export async function createCSVMapper(): Promise<CSVMapper> {
  const mapper = new CSVMapper();
  await mapper.initializeLookupTables();
  return mapper;
}

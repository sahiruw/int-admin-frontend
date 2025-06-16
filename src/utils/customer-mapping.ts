import { createClient as createSupabaseClient } from "@/utils/supabase/supabase";
import { createClient as createBrowserClient } from "@supabase/supabase-js";

// Create a client-side only Supabase client
function createClientSideSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Use this in client components instead of the regular createClient
async function getSupabaseClient() {
  try {
    return await createSupabaseClient();
  } catch (error) {
    console.warn('Falling back to browser-only client:', error);
    return createClientSideSupabase();
  }
}

export interface Customer {
  id: number;
  name: string;
  [key: string]: any;
}

export interface ShippingLocation {
  id: number;
  name: string;
  [key: string]: any;
}

/**
 * Fetches all customers from the database
 */
export async function getAllCustomers(): Promise<Customer[]> {
  const supabaseClient = await getSupabaseClient();
  const { data, error } = await supabaseClient.from("customer").select("*");
  
  if (error) {
    console.error("Error fetching customers:", error);
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Fetches all shipping locations from the database
 */
export async function getAllShippingLocations(): Promise<ShippingLocation[]> {
  const supabaseClient = await getSupabaseClient();
  const { data, error } = await supabaseClient.from("shippinglocation").select("*");
  
  if (error) {
    console.error("Error fetching shipping locations:", error);
    throw new Error(`Failed to fetch shipping locations: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Finds a customer by name, ignoring case differences
 */
export function findCustomerByName(customers: Customer[], name: string): Customer | undefined {
  if (!name) return undefined;
  return customers.find(customer => 
    customer.name.toLowerCase() === name.toLowerCase());
}

/**
 * Finds a shipping location by name, ignoring case differences
 */
export function findShippingLocationByName(locations: ShippingLocation[], name: string): ShippingLocation | undefined {
  if (!name) return undefined;
  return locations.find(location => 
    location.name.toLowerCase() === name.toLowerCase());
}

/**
 * Creates a new customer in the database
 */
export async function createCustomer(name: string): Promise<Customer> {
  if (!name) throw new Error("Customer name is required");
  
  try {
    const supabaseClient = await getSupabaseClient();
    
    // First check if customer with this name already exists (case insensitive)
    const { data: existingCustomer, error: searchError } = await supabaseClient
      .from("customer")
      .select("*")
      .ilike('name', name)
      .maybeSingle();
      
    if (searchError) {
      console.error("Error searching for existing customer:", searchError);
      throw new Error(`Failed to search for existing customer: ${searchError.message}`);
    }
    
    // Return existing customer if found
    if (existingCustomer) {
      console.log(`Customer with name "${name}" already exists, using ID: ${existingCustomer.id}`);
      return existingCustomer as Customer;
    }
    
    // Get the next ID for a new customer
    const { data: existingCustomers, error: fetchError } = await supabaseClient
      .from("customer")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error("Error finding max customer ID:", fetchError);
      throw new Error(`Failed to create customer: ${fetchError.message}`);
    }
    
    const nextId = existingCustomers?.[0]?.id ? existingCustomers[0].id + 1 : 1;
    const newCustomer = { id: nextId, name: name };
    
    const { data, error } = await supabaseClient
      .from("customer")
      .insert(newCustomer)
      .select();
      
    if (error) {
      console.error("Error creating customer:", error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
    
    console.log(`Created new customer "${name}" with ID: ${nextId}`);
    return data?.[0] || newCustomer;
  } catch (err) {
    console.error(`Error in createCustomer for name "${name}":`, err);
    throw err;
  }
}

/**
 * Creates a new shipping location in the database
 */
export async function createShippingLocation(name: string): Promise<ShippingLocation> {
  if (!name) throw new Error("Shipping location name is required");
  
  try {
    const supabaseClient = await getSupabaseClient();
    
    // First check if shipping location with this name already exists (case insensitive)
    const { data: existingLocation, error: searchError } = await supabaseClient
      .from("shippinglocation")
      .select("*")
      .ilike('name', name)
      .maybeSingle();
      
    if (searchError) {
      console.error("Error searching for existing shipping location:", searchError);
      throw new Error(`Failed to search for existing shipping location: ${searchError.message}`);
    }
    
    // Return existing location if found
    if (existingLocation) {
      console.log(`Shipping location with name "${name}" already exists, using ID: ${existingLocation.id}`);
      return existingLocation as ShippingLocation;
    }
    
    // Get the next ID for a new location
    const { data: existingLocations, error: fetchError } = await supabaseClient
      .from("shippinglocation")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error("Error finding max location ID:", fetchError);
      throw new Error(`Failed to create shipping location: ${fetchError.message}`);
    }
    
    const nextId = existingLocations?.[0]?.id ? existingLocations[0].id + 1 : 1;
    const newLocation = { id: nextId, name: name };
    
    const { data, error } = await supabaseClient
      .from("shippinglocation")
      .insert(newLocation)
      .select();
      
    if (error) {
      console.error("Error creating shipping location:", error);
      throw new Error(`Failed to create shipping location: ${error.message}`);
    }
    
    console.log(`Created new shipping location "${name}" with ID: ${nextId}`);
    return data?.[0] || newLocation;
  } catch (err) {
    console.error(`Error in createShippingLocation for name "${name}":`, err);
    throw err;
  }
}

/**
 * Maps customer names to customer IDs, creating new customers if needed
 * @param customerNames Array of customer names to map
 * @returns Map of customer names to IDs
 */
export async function mapCustomerNamesToIds(customerNames: string[]): Promise<Map<string, number>> {
  const customers = await getAllCustomers();
  const result = new Map<string, number>();
  
  // Filter out any null, undefined or empty values
  const validCustomerNames = customerNames.filter(name => name && name.trim() !== '');
  
  for (const name of validCustomerNames) {
    let customer = findCustomerByName(customers, name);
    if (!customer) {
      // Create a new customer
      customer = await createCustomer(name);
      customers.push(customer); // Update local cache
    }
    
    result.set(name, customer.id);
  }
  
  return result;
}

/**
 * Maps shipping location names to shipping location IDs, creating new locations if needed
 * @param locationNames Array of shipping location names to map
 * @returns Map of location names to IDs
 */
export async function mapShippingLocationNamesToIds(locationNames: string[]): Promise<Map<string, number>> {
  const locations = await getAllShippingLocations();
  const result = new Map<string, number>();
  
  // Filter out any null, undefined or empty values
  const validLocationNames = locationNames.filter(name => name && name.trim() !== '');
  
  for (const name of validLocationNames) {
    let location = findShippingLocationByName(locations, name);
    if (!location) {
      // Create a new location
      location = await createShippingLocation(name);
      locations.push(location); // Update local cache
    }
    
    result.set(name, location.id);
  }
  
  return result;
}

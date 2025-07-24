import { createClient } from "@/utils/supabase/supabase";
import { withPermission } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    return await withPermission('customers', 'read', async (user) => {
      const supabaseClient = await createClient();

      const { data, error } = await supabaseClient.from("customer").select("*");

      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while fetching customer",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(data);
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    return await withPermission('customers', 'update', async (user) => {
      const supabaseClient = await createClient();

      const body = await req.text();
      const { payload } = JSON.parse(body);
      const { data, error } = await supabaseClient.from("customer").upsert(payload);

      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while updating customer",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Customer updated successfully",
        data,
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
} 

export async function POST(req: Request) {
  try {
    return await withPermission('customers', 'create', async (user) => {
      const supabaseClient = await createClient();
      const body = await req.text();
      const { payload } = JSON.parse(body);

      const { data, error } = await supabaseClient.from("customer").insert(payload);
      
      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while adding customer",
            error: error.message,
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: "Customer added successfully",
        data,
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    return await withPermission('customers', 'delete', async (user) => {
      const supabaseClient = await createClient();
      const body = await req.text();
      const { id } = JSON.parse(body);

      const { data, error } = await supabaseClient.from("customer").delete().match({ id });
      
      if (error) {
        return NextResponse.json(
          {
            message: "An error occurred while deleting customer",
            error: error.message,
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: "Customer deleted successfully",
        data,
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: error.message.includes('Authentication') ? 401 : 403 }
    );
  }
}
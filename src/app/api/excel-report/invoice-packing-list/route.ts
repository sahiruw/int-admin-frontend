import { getGoogleServices } from "@/utils/google/google";

const TEMPLATE_SHEET_ID = "1h-i9cot1bF3edA19N4AakxgtvI23Ude3tnaMmvjNMv0";
const DEST_FOLDER_ID = "1EKE_4HkQ368GrMGp9p5dDhLQQ0nQPgaV";

export async function POST(req: Request) {
  const body = await req.text();
  const { payload } = JSON.parse(body);
  let { date, records } = payload;

  records = records.map((row) => [
    row.container_number,
    row.age,
    row.variety_name,
    row.breeder_name,
    row.size_cm,
    row.total_weight,
    row.pcs,
    row.jpy_cost,
    row.jpy_total,
    row.box_count,
  ]);

  const { drive, sheets } = await getGoogleServices();

  // // Step 1: Copy the template sheet
  const copyResponse = await drive.files.copy({
    fileId: TEMPLATE_SHEET_ID,
    requestBody: {
      name: `Sheet - ${Date.now()}`,
      parents: [DEST_FOLDER_ID],
    },
    supportsAllDrives: true,
  });

  const spreadsheetId = copyResponse.data?.id;
  // let spreadsheetId = "1muIYDv5bZ0XMtyxPSsdOXVK8q6OEi5Q7U37d6CG0zP4";
  if (!spreadsheetId) {
    console.error("Failed to copy the template sheet.");
    return new Response(
      JSON.stringify({ error: "Failed to copy the template sheet" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  console.log(`Spreadsheet ID: ${spreadsheetId}`);

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  if (!response.data.sheets) {
    console.error("No sheets found in the spreadsheet.");
    return new Response(JSON.stringify({ error: "No sheets found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const sheet = response.data.sheets.find(
    (s) => s.properties?.title === "Template"
  );

  let sheetId = null;
  if (sheet) {
    sheetId = sheet.properties?.sheetId;
    console.log(`Sheet ID for 'Template': ${sheetId}`);
  }

  if (!sheet || !sheetId) {
    console.error("Template sheet not found.");
    return new Response(JSON.stringify({ error: "Template sheet not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // 1. Insert 10 rows after row 32
        {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: 32, // Row 33 (0-based index)
              endIndex: parseInt(32 + records.length), // Row 33 + number of records
            },
            inheritFromBefore: true,
          },
        },
        {
          updateCells: {
            rows: records.map((record) => ({
              values: record.map((value) => ({
                userEnteredValue: getCellValue(value),
              })),
            })),
            fields: "userEnteredValue",
            start: {
              sheetId: sheetId,
              rowIndex: 31, // Starts at row 33 (zero-based)
              columnIndex: 0, // Starts at column A
            },
          },
        },

        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              title: "sahiru",
            },
            fields: "title",
          },
        },
      ],
    },
  });

  // Step: Export spreadsheet as XLSX
  const fileExport = await drive.files.export(
    {
      fileId: spreadsheetId,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
    { responseType: "arraybuffer" } // Ensure we get binary data
  );

  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(fileExport.data);

  // Return response with Excel file blob
  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="KoiData_${Date.now()}.xlsx"`,
    },
  });
}

function getCellValue(value: any) {
  if (typeof value === "string") {
    return { stringValue: value };
  } else if (typeof value === "number") {
    return { numberValue: value };
  } else if (typeof value === "boolean") {
    return { boolValue: value };
  } else {
    return { stringValue: "" }; // fallback for null/undefined
  }
}

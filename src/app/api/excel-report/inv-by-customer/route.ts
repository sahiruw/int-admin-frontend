import { getGoogleServices } from "@/utils/google/google";
import { get_box_sizes } from "../../box-sizes/route";

const TEMPLATE_SHEET_ID = "1-MdbS3i1zQP86Ry8LbTLpwpyRByr9mnXtkejKsN093A";
const DEST_FOLDER_ID = "1IyZJhmGAznpp8dAnxWt6UrhJMijmMzLH";

export async function POST(req: Request) {
  const body = await req.text();
  const { payload } = JSON.parse(body);
  let { customer, records } = payload;


  records = records.map((row) => {

    return [
      row.picture_id,
      row.variety_name,
      row.age,
      row.breeder_name,
      row.pcs,
      row.sale_price_jpy,
      row.comm_jpy,
      row.total_jpy_sales,
      row.pcs ? row.sale_price_jpy / row.pcs : "",
    ];
  });
  


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

  if (!sheet || sheetId === null) {
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

        {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: 4,
              endIndex: parseInt(3 + records.length), 
            },
            inheritFromBefore: false,
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
              rowIndex: 4, 
              columnIndex: 0, 
            },
          },
        },

        {
            updateCells: {
              rows: [
                {
                  values: [
                    {
                      userEnteredValue: {
                        stringValue: customer,
                      },
                    },
                  ],
                },
              ],
              fields: "userEnteredValue",
              start: {
                sheetId: sheetId,
                rowIndex: 0, 
                columnIndex: 0, 
              },
            },
          },

          
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              title: customer,
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

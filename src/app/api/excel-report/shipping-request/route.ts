import { getGoogleServices } from "@/utils/google/google";
import { get_box_sizes } from "../../box-sizes/route";

const TEMPLATE_SHEET_ID = "1xzJp4GJykchG9bsyp_lx-n97FbeH_xmN2aTRMHfFpuk";
const DEST_FOLDER_ID = "1yW_gHBrLxoZtWKAdSYKJL0SDKzINscl6";

export async function POST(req: Request) {
  const body = await req.text();
  const { payload } = JSON.parse(body);
  let { date, breeder, breederID, records } = payload;

  let { data, error } = await get_box_sizes();
  data = data?.filter( (box) => (box.breeder_id === parseInt(breederID)) )

  records = records.map((row) => {
    const box = data.find((box) => box.size === row.box_size);
    return [
      row.container_number,
      row.variety_name,
      row.size_cm,
      row.age,
      row.pcs,
      row.pcs / row.box_count,
      row.weight_of_box,
      row.box_count,
      box ? `${box.length_cm}x${box.width_cm}x${box.thickness_cm}` : '',
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
              startIndex: 9,
              endIndex: parseInt(8 + records.length), 
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
              rowIndex: 9, 
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
                        stringValue: breeder,
                      },
                    },
                  ],
                },
              ],
              fields: "userEnteredValue",
              start: {
                sheetId: sheetId,
                rowIndex: 0, 
                columnIndex: 4, 
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
                        stringValue: new Date(date).toLocaleDateString(),
                    
                      },
                    },
                  ],
                },
              ],
              fields: "userEnteredValue",
              start: {
                sheetId: sheetId,
                rowIndex: 4, 
                columnIndex: 1, 
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

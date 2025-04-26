import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import PuppeteerHTMLPDF from "puppeteer-html-pdf";
import hbs from "handlebars";
import { getImageBlobById } from "@/utils/google/google-drive-pictures";

export async function POST(req: NextRequest) {
  try {
    let { items } = await req.json();

    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        try {
          const response = await getImageBlobById(item.picture_id);

          if (response) {
            const { buffer, mimeType } = await response;

            // // Decode base64 and create Blob
            // const byteCharacters = atob(buffer);
            // const byteNumbers = Array.from(byteCharacters).map((char) =>
            //   char.charCodeAt(0)
            // );
            // const byteArray = new Uint8Array(byteNumbers);
            // const blob = new Blob([byteArray], { type: mimeType });
            // const objectUrl = URL.createObjectURL(blob);

            // return { ...item, imageUrl: objectUrl };
            return { ...item, imageUrl: `data:${mimeType};base64,${buffer}` };
          }

          return item

        } catch (error) {
          console.error("Error fetching image:", error);
          return item; 
        }
      })
    );

    console.log("Items with images:", itemsWithImages);

    const htmlPDF = new PuppeteerHTMLPDF();
    htmlPDF.setOptions({ format: "A4" });

    // Create a simple HTML template
    const htmlTemplate = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .card { border: 1px solid #ccc; padding: 10px; text-align: center; }
          img { width: 100px; height: 150px; object-fit: cover; }
          .info { margin-top: 5px; font-size: 12px; }
        </style>
      </head>
      <body>
      Hi huttho
        <div class="grid">
          {{#each items}}
          <div class="card">
            <img src="{{this.imageUrl}}" alt="{{this.picture_id}}" />
            <div class="info">
              <p>ID: {{this.picture_id}}</p>
              <p>Variety: {{this.variety}}</p>
              <p>Size: {{this.size}}</p>
            </div>
          </div>
          {{/each}}
        </div>
      </body>
      </html>
    `;

    const template = hbs.compile(htmlTemplate);
    const htmlContent = template({ items: itemsWithImages });

    const pdfBuffer = await htmlPDF.create(htmlContent);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="thumbnail-report.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

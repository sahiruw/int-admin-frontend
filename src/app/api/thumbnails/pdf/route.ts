import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import hbs from "handlebars";
import { getImageBlobById } from "@/utils/google/google-drive-pictures";

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    // Fetch images and convert to base64 data URLs
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        try {
          const response = await getImageBlobById(item.picture_id);
          if (response) {
            const { buffer, mimeType } = response;
            const base64 = buffer.toString("base64");
            return { ...item, imageUrl: `data:${mimeType};base64,${base64}` };
          }
          return item;
        } catch (error) {
          console.error("Error fetching image:", error);
          return item;
        }
      })
    );

    // Generate HTML content with Handlebars
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

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for some environments
    });
    const page = await browser.newPage();
    
    // Set HTML content and wait for images to load
    await page.setContent(htmlContent);
    
    // Wait for all images to load
    await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', () => reject(new Error('Image failed to load')));
          });
        })
      );
    });

    console.log("PDF generation started...");

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

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
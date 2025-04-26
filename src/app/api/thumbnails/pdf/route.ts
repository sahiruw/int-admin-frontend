import { NextRequest, NextResponse } from "next/server";
import { getImageBlobById } from "@/utils/google/google-drive-pictures";
import jsPDF from "jspdf";
import { IMAGE_NOT_FOUND_DATA_URL } from "@/utils/image-not-found";

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        try {
          const response = await getImageBlobById(item.picture_id);
          if (response) {
            const { buffer, mimeType } = await response;
            return { ...item, imageUrl: `data:${mimeType};base64,${buffer}` };
          }

        } catch (error) {
          console.error("Error fetching image:", error);
        }

        return {
          ...item,
          imageUrl: IMAGE_NOT_FOUND_DATA_URL, // fallback from public folder
        };
      })
    );

    const pdf = new jsPDF('p', 'mm', 'a4', true);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const marginX = 10;
    const marginY = 10;
    const spacingX = 2;
    const spacingY = 5;
    const numCols = 4;
    const numRows = 3;
    const cellWidth = (pageWidth - marginX * 2 - spacingX * (numCols - 1)) / numCols;
    const cellHeight = (pageHeight - marginY * 2 - spacingY * (numRows - 1)) / numRows;

    itemsWithImages.forEach((item, index) => {
      if (index > 0 && index % (numCols * numRows) === 0) {
        drawFooter(pdf); // Add footer before adding a new page
        pdf.addPage();
      }
    
      const positionInPage = index % (numCols * numRows);
      const row = Math.floor(positionInPage / numCols);
      const col = positionInPage % numCols;
    
      const x = marginX + col * (cellWidth + spacingX);
      const y = marginY + row * (cellHeight + spacingY);
    
      const aspectRatio = 400 / 647; // Given aspect ratio
      let imgWidth = cellWidth;
      let imgHeight = imgWidth / aspectRatio;
    
      // If the calculated height is too big for the cell, adjust
      if (imgHeight > cellHeight * 0.6) { // Use 60% of the cell height max
        imgHeight = cellHeight * 0.6;
        imgWidth = imgHeight * aspectRatio;
      }
    
      const imageX = x + (cellWidth - imgWidth) / 2; // Center the image inside the cell
      const imageY = y; // Start from top of cell
    
      if (item.imageUrl) {
        pdf.addImage(item.imageUrl, 'JPEG', imageX, imageY, imgWidth, imgHeight);
      }
    
      const textStartY = imageY + imgHeight + 5; // Text starts a little below image
    
      pdf.setFontSize(8);
      pdf.text(`ID: ${item.picture_id}`, imageX + 2, textStartY);
      pdf.text(`Variety: ${item.variety}`, imageX + 2, textStartY + 4);
      pdf.text(`Size: ${item.size}`, imageX + 2, textStartY + 8);
    });
    

    drawFooter(pdf);
    const pdfBuffer = pdf.output('arraybuffer');
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="thumbnail-grid.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}


function drawFooter(pdf: jsPDF) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const footerText = "Niigata Koi Global";
  const textWidth = pdf.getTextWidth(footerText);
  const marginBottom = 10;

  pdf.setFontSize(10);
  pdf.text(footerText, pageWidth - textWidth - 20, pdf.internal.pageSize.getHeight() - marginBottom);
}

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
            const { buffer, mimeType, size } = await response;
            return { ...item, imageUrl: `data:${mimeType};base64,${buffer}`, imageSize :size };
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
    
      // Use actual image ratio (fall back to square if missing)
      const originalWidth = item.imageSize?.width || 1; 
      const originalHeight = item.imageSize?.height || 1;
      const aspectRatio = originalWidth / originalHeight;

      // Max bounds inside the cell (say 60% of cell height for image)
      const maxWidth = cellWidth;
      const maxHeight = cellHeight * 0.6;

      // Scale proportionally
      let imgWidth = maxWidth;
      let imgHeight = imgWidth / aspectRatio;

      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      // Center the image inside the cell
      const imageX = x + (cellWidth - imgWidth) / 2;
      const imageY = y;

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

# Form Forge 🔨

A modern, full-stack web application for creating fillable PDF forms with drag-and-drop functionality.

## Features

### Form Builder Mode
- **Blank Canvas**: Start from scratch with a blank page
- **Drag & Drop**: Intuitive field placement from the palette
- **Field Types**:
  - Text Input
  - Date Field
  - Checkbox
  - Signature Box
  - Text Label
- **Advanced Editing**:
  - Drag fields to reposition
  - Resize with corner handles
  - Edit properties in real-time
  - Delete, duplicate fields
  - Undo/Redo support
- **Visual Tools**:
  - Grid overlay for alignment
  - Zoom in/out (25% - 200%)
  - Multi-page support
- **Export & Save**:
  - Export as fillable PDF
  - Save/load layouts as JSON

### PDF Editor Mode
- **Upload Existing PDF**: Add fields to any PDF document
- **Multi-page Support**: Navigate through PDF pages
- **Field Overlay**: Add fillable fields on top of PDF content
- **Same Editing Tools**: All Form Builder features available

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- React DnD (Drag and Drop)
- Axios (HTTP client)
- PDF.js (PDF rendering)

**Backend:**
- Node.js + Express
- pdf-lib (PDF generation)
- Multer (File uploads)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Project Structure

```
formforge/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Canvas.js              # Form builder canvas
│   │   ├── Canvas.css
│   │   ├── FieldPalette.js        # Draggable field types
│   │   ├── FieldPalette.css
│   │   ├── FieldRenderer.js       # Individual field component
│   │   ├── FieldRenderer.css
│   │   ├── Navbar.js              # Top navigation
│   │   ├── Navbar.css
│   │   ├── PdfCanvas.js           # PDF display with overlay
│   │   ├── PdfCanvas.css
│   │   ├── PropertiesPanel.js     # Field settings editor
│   │   └── PropertiesPanel.css
│   ├── pages/
│   │   ├── FormBuilder.js         # Form builder page
│   │   ├── FormBuilder.css
│   │   ├── PdfEditor.js           # PDF editor page
│   │   └── PdfEditor.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── server/
│   ├── routes/
│   │   └── pdfRoutes.js           # API endpoints
│   ├── services/
│   │   └── pdfService.js          # PDF generation logic
│   ├── uploads/                   # Temporary upload storage
│   ├── index.js                   # Express server
│   └── package.json
└── package.json
```

## API Endpoints

### POST `/api/pdf/upload`
Upload a PDF file to add fields to it.

**Request:**
- Content-Type: multipart/form-data
- Body: PDF file

**Response:**
```json
{
  "success": true,
  "filename": "uploaded-file.pdf",
  "pdfBase64": "...",
  "pageCount": 3,
  "pages": [
    { "pageNumber": 1, "width": 612, "height": 792 },
    ...
  ]
}
```

### POST `/api/pdf/generate-from-layout`
Generate a fillable PDF from scratch based on field layout.

**Request:**
```json
{
  "fields": [
    {
      "id": "field_1",
      "type": "text",
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 30,
      "page": 1,
      "label": "Name"
    }
  ],
  "pageSize": { "width": 612, "height": 792 }
}
```

**Response:** PDF file (application/pdf)

### POST `/api/pdf/generate-from-existing`
Add fillable fields to an existing PDF.

**Request:**
```json
{
  "pdfBase64": "base64-encoded-pdf",
  "fields": [...]
}
```

**Response:** PDF file (application/pdf)

## Usage Guide

### Creating a Form from Scratch

1. Navigate to **Form Builder** tab
2. Drag field types from the left sidebar onto the canvas
3. Click a field to select it
4. Use the right sidebar to edit properties
5. Resize using corner handles
6. Click **Export PDF** to download

### Adding Fields to Existing PDF

1. Navigate to **PDF Editor** tab
2. Click **Choose PDF File** to upload
3. Navigate pages using the page controls
4. Drag fields onto the PDF
5. Position and customize fields
6. Click **Export PDF** to download

### Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Delete**: Delete selected field
- **Click**: Select field
- **Drag**: Move field
- **Corner handles**: Resize field

## Advanced Features

### Undo/Redo
History tracking allows you to undo/redo changes to the form layout.

### Save/Load Layouts
Save your form layout as JSON and reload it later:
- Click **Save** to export layout.json
- Click **Load** to import a saved layout

### Multi-page Forms
- Set the `page` property for each field
- Use page navigation in PDF Editor mode
- Forms can have unlimited pages

### Snap-to-Grid
Enable grid overlay for precise alignment:
- Click the **Grid** button in the toolbar
- Visual grid appears at 20px intervals

## Customization

### Changing Page Size
Default is Letter (612 x 792 points). To customize:

```javascript
const [pageSize] = useState({ 
  width: 612,  // A4: 595, Legal: 612
  height: 792  // A4: 842, Legal: 1008
});
```

### Adding New Field Types
1. Add type to `FieldPalette.js` FIELD_TYPES array
2. Add rendering logic in `FieldRenderer.js`
3. Add PDF generation logic in `pdfService.js`

## Design Philosophy

FormForge uses a warm, earth-toned aesthetic with:
- Space Mono (monospace) for headings
- Work Sans for body text
- Terracotta and sage accent colors
- Soft shadows and rounded corners
- Minimal, purposeful animations

## Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify Node.js version (v16+)
- Run `npm install` in server directory

### PDF not rendering
- Check browser console for errors
- Verify PDF.js CDN is accessible
- Ensure PDF file is valid

### Export fails
- Ensure backend server is running
- Check network tab for API errors
- Verify fields array is not empty

### Fields not appearing
- Check field coordinates are within page bounds
- Verify page number matches current page
- Look for console errors

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ⚠️ Limited (desktop recommended)

## Contributing

This is a demonstration project. Feel free to:
- Add new field types
- Improve PDF generation
- Enhance UI/UX
- Add database persistence
- Implement user authentication

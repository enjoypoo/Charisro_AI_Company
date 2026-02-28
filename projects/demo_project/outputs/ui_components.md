# UI Components Specification

## Header
- **Description**: The top navigation bar serving as the main header for app navigation.
- **Style Classes**: `header`, `bg-primary`, `text-white`

## Album Component
- **Description**: Displays a collection of photos grouped by event or time.
- **Structure**:
  - Title: `album-title`, `text-xl`
  - Description: `album-description`, `text-gray-600`
  - Photo Grid: `photo-grid`, `grid-cols-2`
- **Style Classes**: `album`, `bg-white`, `shadow-md`, `rounded-lg`

## Detailed Record Section
- **Description**: Allows for inputting more contextual information about the album.
- **Structure**:
  - Title: `detail-title`, `text-lg`
  - Input Field: `input-field`, `border-gray-300`
  - Caption: `caption`, `text-sm`
- **Style Classes**: `detail`, `flex-col`, `gap-4`

## Date-based List
- **Description**: Provides a list view of albums organized by date.
- **Structure**:
  - Date Section: `date-section`, `text-primary`
- **Style Classes**: `date-list`, `flex-col`, `gap-4`

## PDF Export Button
- **Description**: A button for exporting albums into a PDF format.
- **Style Classes**: `pdf-export`, `bg-secondary`, `font-bold`, `rounded`

## Fullscreen Photo View
- **Description**: Opens the selected photo in full screen.
- **Structure**:
  - Photo: `fullscreen-photo img`, `max-w-full`
  - Caption Overlay: `overlay-caption`, `bg-opacity-75`
- **Style Classes**: `fullscreen-photo`, `fixed`, `bg-black`

# Grid Equipment Game

A Next.js-based grid equipment management game where players can purchase and strategically place items in their inventory to enhance their character's stats.

## Features

- Grid-based inventory system with drag-and-drop functionality
- Shop system with random items and reroll mechanism
- Item placement rules and validation
- Special effects system for item combinations
- Real-time stat calculations

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to play the game.

## Game Rules

### Inventory System
- Grid coordinates start from (0,0) at bottom-left
- Items can be dragged from shop to inventory
- Items can be repositioned within inventory
- Items can be discarded by dragging out of inventory

### Item Placement Rules
- All items must be placed within grid boundaries
- Items cannot overlap
- Non-bag items must be placed in areas covered by bags
- Items can be rotated (0°, 90°, 180°, 270°)

### Shop System
- Displays 4 random items
- Reroll costs 10 gold
- Items can be purchased by dragging to inventory

### Special Effects
- Accessories activate when placed adjacent to compatible items
- Effects stack based on item properties
- Real-time stat updates when effects activate

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- React DnD (for drag and drop)

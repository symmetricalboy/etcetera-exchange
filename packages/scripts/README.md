# Object Generation Scripts

This package contains scripts to generate thousands of whimsical objects for the etcetera.exchange bot using the Gemini API and Imagen for image generation.

## Setup

1. Copy `.env.example` to `.env` and fill in your Gemini API key
2. Install dependencies: `npm install`
3. Ensure the database is set up: `cd ../database && npm run migrate`

## Usage

### Test Generation
Generate a few sample objects to test the system:
```bash
npm run test:generation
```

### Small Batch (100 objects)
Generate a small batch for testing:
```bash
npm run generate:objects
```

### Full Catalog (10,000+ objects)
Generate the full catalog of objects:
```bash
npm run generate:batch
```

### Custom Count
Generate a specific number of objects:
```bash
node generate-objects.js --batch --count=5000
```

## Object Rarities

The script generates objects with the following rarity distribution:

- **Common (40%)**: Everyday objects with whimsical properties
- **Uncommon (25%)**: Quirky objects with unusual but recognizable features  
- **Rare (20%)**: Magical items from a cozy fantasy world
- **Epic (10%)**: Powerful magical objects
- **Legendary (4%)**: Extraordinary items with incredible properties
- **Mythic (0.9%)**: Reality-bending objects of immense wonder
- **Unique (0.1%)**: One-of-a-kind items that defy all logic

## Images

The script automatically generates images for each object using Imagen 3.0. Images are saved locally in the `generated-images/` directory and referenced in the database.

## Rate Limiting

The script includes delays between API calls to avoid rate limiting:
- 1 second between individual objects
- 3 seconds between batches
- Smaller batch sizes for rarer objects

## Example Objects

**Common**: "A paperclip that remembers important phone numbers" 📎

**Rare**: "A snow globe containing a miniature thunderstorm" 🌨️

**Unique**: "The last hiccup in the universe, preserved in a soap bubble" 🫧

## Tips

- Start with a test run to ensure everything works
- Monitor the console output for any errors
- Generated images are saved locally - you may want to set up cloud storage for production
- The script can be safely interrupted and resumed (it won't duplicate objects)
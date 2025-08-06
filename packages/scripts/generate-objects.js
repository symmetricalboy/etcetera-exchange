const { genai } = require('google-genai');
const Database = require('@etcetera/database');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Initialize Gemini client
const client = genai.Client();

// Object generation prompts for different rarities
const GENERATION_PROMPTS = {
    common: `Generate 20 mundane, everyday objects with whimsical descriptions. Each object should be something you might find around a house, office, or street, but described in an amusing or slightly magical way. Examples: "A slightly bent paperclip that remembers important dates", "A coffee mug that stays exactly room temperature", "A pen that only writes in navy blue on Tuesdays".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "📎", "tags": ["office", "metal", "useful"]}]`,

    uncommon: `Generate 15 quirky objects that are a bit more unusual but still recognizable. These should be things that exist but with magical or absurd properties. Examples: "A rubber duck that quacks in different languages", "A doorknob that only turns for people named Kevin", "A bookmark that remembers where you left off in your dreams".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "🦆", "tags": ["bathroom", "rubber", "multilingual"]}]`,

    rare: `Generate 10 imaginative objects that are clearly fantastical but still charming. These should be magical items that sound like they belong in a cozy fantasy world. Examples: "A snow globe containing a miniature thunderstorm", "A compass that points to the nearest bookstore", "A teacup that refills itself with whatever beverage you're craving".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "🔮", "tags": ["magical", "navigation", "bookstore"]}]`,

    epic: `Generate 8 wondrous objects with clearly magical properties that would be considered quite powerful or rare. These should feel special and coveted. Examples: "A mirror that shows you wearing any outfit you imagine", "A seedling that grows into whatever fruit you're thinking of", "A music box that plays the melody of your happiest memory".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "🪞", "tags": ["reflection", "appearance", "magical"]}]`,

    legendary: `Generate 5 extraordinary objects with incredible magical properties. These should be truly special items that anyone would be thrilled to own. Examples: "A blanket that gives you perfect dreams about any topic you choose", "A paintbrush that brings paintings to life for exactly 37 seconds", "A pair of socks that let you walk on any surface including water and clouds".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "🎨", "tags": ["dreams", "sleep", "magical"]}]`,

    mythic: `Generate 3 absolutely incredible objects with reality-bending properties. These should be items of immense wonder and power, but still whimsical rather than dark. Examples: "A pocket watch that lets you pause time for everyone except cats", "A kaleidoscope that shows you parallel universes where you made different breakfast choices", "A pair of mittens that let you high-five people through photographs".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "⏰", "tags": ["time", "cats", "reality"]}]`,

    unique: `Generate 1 absolutely one-of-a-kind object that defies all logic but in a delightful way. This should be something so special and bizarre that only one could ever exist. Examples: "The last hiccup in the universe, carefully preserved in a soap bubble", "A rubber band made from concentrated Tuesday energy", "The shadow of a song that was never written, somehow visible to the naked eye".

Return a JSON array with objects in this format:
[{"name": "Object Name", "description": "Whimsical description", "emoji": "🫧", "tags": ["unique", "metaphysical", "impossible"]}]`
};

// Image generation prompts for different styles
const IMAGE_STYLES = [
    "cute kawaii style illustration",
    "whimsical watercolor painting",
    "charming pixel art style",
    "soft pastel digital art",
    "hand-drawn sketch with gentle colors",
    "cozy storybook illustration",
    "minimalist cute design",
    "warm and friendly cartoon style"
];

class ObjectGenerator {
    constructor() {
        this.imageDirectory = path.join(__dirname, 'generated-images');
        this.ensureImageDirectory();
    }

    async ensureImageDirectory() {
        await fs.ensureDir(this.imageDirectory);
    }

    async generateObjectBatch(rarity, count = 1) {
        console.log(`🎲 Generating ${count} ${rarity} objects...`);
        
        const prompt = GENERATION_PROMPTS[rarity];
        if (!prompt) {
            throw new Error(`Unknown rarity: ${rarity}`);
        }

        try {
            const response = await client.models.generate_content({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    response_mime_type: "application/json",
                    temperature: 0.9, // High creativity
                    max_output_tokens: 4096
                }
            });

            const objects = JSON.parse(response.text);
            console.log(`✅ Generated ${objects.length} ${rarity} objects`);
            
            return objects.map(obj => ({
                ...obj,
                rarity,
                is_unique: rarity === 'unique'
            }));

        } catch (error) {
            console.error(`❌ Failed to generate ${rarity} objects:`, error);
            return [];
        }
    }

    async generateImage(objectName, objectDescription, rarity) {
        console.log(`🖼️  Generating image for: ${objectName}`);
        
        const style = IMAGE_STYLES[Math.floor(Math.random() * IMAGE_STYLES.length)];
        const rarityModifier = rarity === 'common' ? 'simple and everyday' : 
                              rarity === 'unique' ? 'otherworldly and impossible' :
                              'magical and whimsical';

        const prompt = `A ${rarityModifier} ${objectName.toLowerCase()}: ${objectDescription}. ${style}. Clean background, centered object, high quality, no text or watermarks.`;

        try {
            const result = await client.models.generate_images({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    number_of_images: 1,
                    output_mime_type: "image/jpeg",
                    aspect_ratio: "1:1",
                    person_generation: "DONT_ALLOW"
                }
            });

            if (result.generated_images && result.generated_images.length > 0) {
                // Save image to local file
                const filename = `${objectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}.jpg`;
                const filepath = path.join(this.imageDirectory, filename);
                
                await fs.writeFile(filepath, result.generated_images[0].image.image_bytes);
                console.log(`💾 Saved image: ${filename}`);
                
                return filename; // Return filename to store in database
            }
        } catch (error) {
            console.error(`❌ Failed to generate image for ${objectName}:`, error);
            return null;
        }
    }

    async saveObjectsToDatabase(objects) {
        console.log(`💾 Saving ${objects.length} objects to database...`);
        
        let savedCount = 0;
        for (const obj of objects) {
            try {
                // Generate image for the object
                const imageFilename = await this.generateImage(obj.name, obj.description, obj.rarity);
                const imageUrl = imageFilename ? `/images/objects/${imageFilename}` : null;

                // Save to database
                await Database.addObject(
                    obj.name,
                    obj.description,
                    imageUrl,
                    obj.rarity,
                    obj.is_unique,
                    obj.emoji,
                    obj.tags || []
                );
                
                savedCount++;
                console.log(`✅ Saved: ${obj.name} (${obj.rarity})`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ Failed to save ${obj.name}:`, error);
            }
        }
        
        console.log(`🎉 Successfully saved ${savedCount}/${objects.length} objects!`);
        return savedCount;
    }

    async generateFullCatalog(totalObjects = 10000) {
        console.log(`🚀 Starting generation of ${totalObjects} objects...`);
        
        // Calculate distribution based on rarity weights
        const distribution = {
            common: Math.floor(totalObjects * 0.40),     // 40%
            uncommon: Math.floor(totalObjects * 0.25),   // 25%
            rare: Math.floor(totalObjects * 0.20),       // 20%
            epic: Math.floor(totalObjects * 0.10),       // 10%
            legendary: Math.floor(totalObjects * 0.04),  // 4%
            mythic: Math.floor(totalObjects * 0.009),    // 0.9%
            unique: Math.floor(totalObjects * 0.001)     // 0.1%
        };

        console.log('📊 Generation distribution:', distribution);

        let totalGenerated = 0;
        for (const [rarity, count] of Object.entries(distribution)) {
            if (count === 0) continue;
            
            console.log(`\n🎯 Generating ${rarity} objects (${count} total)...`);
            
            // Generate in batches to avoid overwhelming the API
            const batchSize = rarity === 'common' ? 20 : 
                             rarity === 'uncommon' ? 15 :
                             rarity === 'rare' ? 10 :
                             rarity === 'epic' ? 8 :
                             rarity === 'legendary' ? 5 :
                             rarity === 'mythic' ? 3 : 1;
            
            let remaining = count;
            while (remaining > 0) {
                const currentBatch = Math.min(remaining, batchSize);
                
                const objects = await this.generateObjectBatch(rarity, currentBatch);
                if (objects.length > 0) {
                    const saved = await this.saveObjectsToDatabase(objects);
                    totalGenerated += saved;
                }
                
                remaining -= currentBatch;
                
                // Longer delay between batches
                if (remaining > 0) {
                    console.log(`⏱️  Waiting before next batch... (${remaining} ${rarity} objects remaining)`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
        }
        
        console.log(`\n🎊 COMPLETE! Generated ${totalGenerated} total objects!`);
        return totalGenerated;
    }

    async testGeneration() {
        console.log('🧪 Testing object generation...');
        
        // Test generation for each rarity
        for (const rarity of ['common', 'uncommon', 'rare']) {
            console.log(`\nTesting ${rarity} generation...`);
            const objects = await this.generateObjectBatch(rarity);
            if (objects.length > 0) {
                console.log(`Sample ${rarity} object:`, objects[0]);
            }
        }
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const generator = new ObjectGenerator();

    try {
        if (args.includes('--test')) {
            await generator.testGeneration();
        } else if (args.includes('--batch')) {
            const count = parseInt(args.find(arg => arg.startsWith('--count='))?.split('=')[1]) || 1000;
            await generator.generateFullCatalog(count);
        } else {
            // Default: generate a smaller test batch
            console.log('🎲 Generating test batch of objects...');
            await generator.generateFullCatalog(100);
        }
    } catch (error) {
        console.error('💥 Generation failed:', error);
        process.exit(1);
    } finally {
        await Database.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = { ObjectGenerator };
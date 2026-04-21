const CHUNK_SIZE = 8000;

// Create 5000 words of Lorem Ipsum without newlines
const word = "apple ";
const content = word.repeat(5000); // 30,000 characters

let chunks = [];
let currentChunk = '';

const paragraphs = content.split(/(?<=\n\s*\n)/);

for (let p of paragraphs) {
  if (p.length > CHUNK_SIZE) {
    const lines = p.split(/(?<=\n)/);
    for (let line of lines) {
      if (line.length > CHUNK_SIZE) {
        const sentences = line.split(/(?<=\.|\?|\!)\s+/);
        for (let sentence of sentences) {
           if ((currentChunk.length + sentence.length) > CHUNK_SIZE && currentChunk.length > 0) {
             chunks.push(currentChunk.trim());
             currentChunk = sentence + ' ';
           } else {
             currentChunk += sentence + ' ';
           }
        }
      } else {
        if ((currentChunk.length + line.length) > CHUNK_SIZE && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = line;
        } else {
          currentChunk += line;
        }
      }
    }
  } else {
    if ((currentChunk.length + p.length) > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = p;
    } else {
      currentChunk += p;
    }
  }
}

if (currentChunk.trim()) {
  chunks.push(currentChunk.trim());
}

console.log("Number of chunks:", chunks.length);
console.log("Original content char length:", content.length);
console.log("Reconstructed char length:", chunks.join("").length);

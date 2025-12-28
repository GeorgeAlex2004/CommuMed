# Documentation Folder

Place your medical documentation PDF file here.

## Setup Instructions

1. **Place your PDF** in this folder and name it `documentation.pdf`
   - Or provide the path when running the embedding script

2. **Generate embeddings** by running:
   ```bash
   npm run generate-embeddings
   ```
   
   Or with a custom path:
   ```bash
   npm run generate-embeddings -- path/to/your/documentation.pdf
   ```

3. **Wait for processing** - This will:
   - Extract text from the PDF
   - Generate vector embeddings for each chunk
   - Save embeddings to `data/embeddings.json`

4. **Start the application**:
   ```bash
   npm run dev
   ```

## Requirements

- Ollama must be running (`ollama serve`)
- Embedding model must be available:
  - Recommended: `nomic-embed-text` (pull with `ollama pull nomic-embed-text`)
  - Fallback: `llama3.2` (if nomic-embed-text is not available)

## Notes

- The embedding generation process may take a while depending on PDF size
- Embeddings are stored in `data/embeddings.json`
- You only need to regenerate embeddings when the documentation changes


"""
Hugging Face Space API for CommuMed
This Space serves as the LLM API endpoint accessible via Gradio API
"""
import os
import gradio as gr
from transformers import pipeline
from sentence_transformers import SentenceTransformer

# Model configuration
CHAT_MODEL = os.getenv("CHAT_MODEL", "meta-llama/Llama-3.2-3B-Instruct")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# Initialize models (lazy loading)
chat_pipeline = None
embedding_model = None

def get_chat_pipeline():
    """Lazy load chat pipeline"""
    global chat_pipeline
    if chat_pipeline is None:
        print(f"Loading chat model: {CHAT_MODEL}...")
        chat_pipeline = pipeline(
            "text-generation",
            model=CHAT_MODEL,
            device_map="auto"
        )
    return chat_pipeline

def get_embedding_model():
    """Lazy load embedding model"""
    global embedding_model
    if embedding_model is None:
        print(f"Loading embedding model: {EMBEDDING_MODEL}...")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL)
    return embedding_model

def chat_api(messages, temperature=0.1, max_tokens=2000):
    """Chat API endpoint"""
    try:
        # Format messages into prompt
        prompt = ""
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                prompt += f"System: {content}\n\n"
            elif role == "user":
                prompt += f"User: {content}\n\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n\n"
        prompt += "Assistant:"
        
        # Generate response
        pipeline = get_chat_pipeline()
        outputs = pipeline(
            prompt,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True,
            return_full_text=False
        )
        
        response_text = outputs[0]["generated_text"].strip()
        return {"response": response_text, "error": None}
    except Exception as e:
        return {"response": None, "error": str(e)}

def embedding_api(text):
    """Embedding API endpoint"""
    try:
        model = get_embedding_model()
        embedding = model.encode(text, convert_to_numpy=True)
        return {"embedding": embedding.tolist(), "error": None}
    except Exception as e:
        return {"embedding": None, "error": str(e)}

# Create Gradio interface
with gr.Blocks() as demo:
    gr.Markdown("# CommuMed LLM API")
    gr.Markdown("This Space provides LLM and embedding services for CommuMed")
    
    with gr.Tab("Chat"):
        messages_input = gr.JSON(
            label="Messages",
            value=[{"role": "user", "content": "Hello"}]
        )
        temperature_input = gr.Slider(0, 1, value=0.1, label="Temperature")
        max_tokens_input = gr.Number(2000, label="Max Tokens")
        chat_output = gr.JSON(label="Response")
        chat_button = gr.Button("Generate")
        chat_button.click(
            chat_api,
            inputs=[messages_input, temperature_input, max_tokens_input],
            outputs=chat_output
        )
    
    with gr.Tab("Embedding"):
        text_input = gr.Textbox(label="Text", value="Hello world")
        embedding_output = gr.JSON(label="Embedding")
        embedding_button = gr.Button("Generate Embedding")
        embedding_button.click(
            embedding_api,
            inputs=text_input,
            outputs=embedding_output
        )

# Launch with API enabled
demo.launch(server_name="0.0.0.0", server_port=7860)

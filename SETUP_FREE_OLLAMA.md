# Setup Free Ollama Backend - Quick Guide

## 🏆 Best Option: Oracle Cloud Free Tier

### Why Oracle Cloud?
- ✅ **Completely free forever** (no credit card needed)
- ✅ Reliable 24/7 uptime
- ✅ Good performance for Ollama
- ✅ 4 CPU cores, 24 GB RAM total

### Step-by-Step Setup

#### 1. Create Oracle Cloud Account
1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Click "Start for Free"
3. Sign up (no credit card required in most regions)
4. Verify your email

#### 2. Create Free ARM Instance
1. After login, go to **"Compute" → "Instances"**
2. Click **"Create Instance"**
3. Configure:
   - **Name:** `ollama-backend`
   - **Image:** Ubuntu 22.04
   - **Shape:** Select **"Ampere A1"** (ARM)
   - **Always Free Eligible:** ✅ Check this
   - **OCPU Count:** 2 (free tier limit)
   - **Memory:** 12 GB (free tier limit)
   - **Add SSH Keys:** Generate or upload your public key
4. Click **"Create"**

#### 3. Configure Firewall
1. Go to **"Networking" → "Security Lists"**
2. Click on your VCN's default security list
3. Click **"Add Ingress Rules"**
4. Configure:
   - **Source:** `0.0.0.0/0` (all IPs)
   - **IP Protocol:** TCP
   - **Destination Port Range:** `11434`
   - **Description:** `Ollama API`
5. Click **"Add Ingress Rules"**

#### 4. Connect and Install Ollama
```bash
# SSH into your instance (use the public IP from Oracle dashboard)
ssh opc@YOUR_INSTANCE_IP

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama (accessible from internet)
OLLAMA_HOST=0.0.0.0:11434 ollama serve &

# Pull required models
ollama pull llama3.2
ollama pull nomic-embed-text

# Verify it's working
curl http://localhost:11434/api/tags
```

#### 5. Keep Ollama Running (Systemd Service)
```bash
# Create systemd service file
sudo nano /etc/systemd/system/ollama.service
```

Paste this:
```ini
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
User=opc
Environment="OLLAMA_HOST=0.0.0.0:11434"
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
sudo systemctl status ollama
```

#### 6. Test from Your Computer
```bash
# Replace with your instance's public IP
curl http://YOUR_INSTANCE_IP:11434/api/tags
```

You should see your models listed!

#### 7. Use in Vercel
Set this environment variable in Vercel:
```
OLLAMA_BASE_URL = http://YOUR_INSTANCE_IP:11434
```

---

## 🏠 Alternative: Local Machine + Cloudflare Tunnel

If you prefer to run Ollama on your own computer:

### Setup Steps

1. **Install Ollama locally:**
   ```bash
   # Windows: Download from ollama.com
   # Mac/Linux:
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Install Cloudflare Tunnel:**
   - Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
   - Or: `brew install cloudflare/cloudflare/cloudflared` (Mac)

4. **Create Tunnel (in new terminal):**
   ```bash
   cloudflared tunnel --url http://localhost:11434
   ```
   
   This gives you a URL like: `https://abc123-def456.trycloudflare.com`

5. **Use in Vercel:**
   ```
   OLLAMA_BASE_URL = https://abc123-def456.trycloudflare.com
   ```

**Note:** URL changes each time you restart. For persistent URL, set up a named tunnel (see FREE_OLLAMA_HOSTING.md).

---

## 📊 Quick Comparison

| Option | Cost | Setup Time | Reliability | Best For |
|--------|------|------------|-------------|----------|
| **Oracle Cloud** | Free | 15 min | ⭐⭐⭐⭐⭐ | Production |
| **Cloudflare Tunnel** | Free | 5 min | ⭐⭐⭐ | Development |

---

## ✅ Verification Checklist

- [ ] Ollama is running: `curl http://your-url:11434/api/tags`
- [ ] Models are pulled: `ollama list`
- [ ] Firewall allows port 11434
- [ ] Systemd service is enabled (Oracle Cloud)
- [ ] Test from Vercel deployment

---

## 🆘 Troubleshooting

**"Connection refused"**
- Check firewall rules (port 11434 open)
- Verify `OLLAMA_HOST=0.0.0.0:11434` is set
- Check Ollama is running: `ps aux | grep ollama`

**"Model not found"**
- Pull models: `ollama pull llama3.2`
- List models: `ollama list`

**"Timeout in Vercel"**
- Check Ollama URL is correct
- Verify instance is running (Oracle Cloud)
- Test with curl from your computer

---

## 📝 Next Steps

1. ✅ Set up Ollama (choose one option above)
2. ✅ Get your Ollama URL
3. ✅ Add to Vercel environment variables:
   - `OLLAMA_BASE_URL = http://your-ollama-url:11434`
   - `EMBEDDINGS_URL = https://your-embeddings-url.json`
   - `EMBEDDING_MODEL = nomic-embed-text`
   - `OLLAMA_MODEL = llama3.2`
4. ✅ Deploy to Vercel
5. ✅ Test the chat interface!

For more details, see [FREE_OLLAMA_HOSTING.md](./FREE_OLLAMA_HOSTING.md)


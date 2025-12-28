# Free Options for Hosting Ollama Backend

Here are the **completely free** options for hosting your Ollama service:

## 🏆 Best Free Options

### 1. **Oracle Cloud Free Tier** (Recommended - Most Reliable)

**What you get:**
- ✅ **2 Always-Free ARM-based VMs** (Ampere A1)
- ✅ 4 OCPU cores and 24 GB RAM total
- ✅ 200 GB storage
- ✅ **No credit card required** (in most regions)
- ✅ **Never expires** (truly always free)

**Setup:**
```bash
# Create free ARM instance (Ampere A1)
# 1. Sign up at cloud.oracle.com
# 2. Create an Ampere A1 instance (2 OCPU, 12 GB RAM)
# 3. Install Ollama:
curl -fsSL https://ollama.com/install.sh | sh
OLLAMA_HOST=0.0.0.0:11434 ollama serve
ollama pull llama3.2
ollama pull nomic-embed-text
```

**Pros:**
- Truly free forever
- Good performance (ARM processors work well with Ollama)
- Reliable uptime
- No credit card needed

**Cons:**
- ARM architecture (some models may be slower)
- Account approval can take time
- Limited to 2 instances

**Guide:** [Oracle Cloud Free Tier Setup](#oracle-cloud-setup)

---

### 2. **Local Machine + Cloudflare Tunnel** (100% Free)

**What you get:**
- ✅ Run Ollama on your own computer
- ✅ Free public URL via Cloudflare Tunnel
- ✅ No cloud costs

**Setup:**
```bash
# 1. Install Cloudflare Tunnel
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

# 2. Run Ollama locally
ollama serve

# 3. Create tunnel
cloudflared tunnel --url http://localhost:11434
# This gives you a public URL like: https://abc123.trycloudflare.com
```

**Pros:**
- Completely free
- Full control
- No cloud limitations

**Cons:**
- Your computer must be on 24/7
- Internet connection must be stable
- URL changes on restart (unless you set up domain)

**Guide:** [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)

---

### 3. **Render Free Tier** (Limited Free Hours)

**What you get:**
- ✅ 750 free hours/month
- ✅ Free tier available
- ✅ Automatic deployments

**Limitations:**
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds
- ⚠️ Requires credit card (but won't charge if you stay within limits)

**Setup:**
1. Create account at render.com
2. Create new "Web Service"
3. Use Dockerfile or shell script to install Ollama
4. Set environment: `OLLAMA_HOST=0.0.0.0:11434`

**Pros:**
- Easy setup
- Automatic HTTPS
- Good for development/testing

**Cons:**
- Spins down (slow first request)
- Limited free hours
- May require credit card

---

### 4. **Railway Free Tier** (Limited Credits)

**What you get:**
- ✅ $5 free credits/month
- ✅ Simple deployment
- ✅ Good performance

**Limitations:**
- ⚠️ $5 credits = ~50-100 hours depending on instance size
- ⚠️ Requires credit card
- ⚠️ Will pause when credits run out

**Setup:**
1. Sign up at railway.app
2. Create new project
3. Deploy with Dockerfile or Nixpacks
4. Set environment variables

**Pros:**
- Easy to use
- Good documentation
- Fast deployments

**Cons:**
- Limited free credits
- May need to upgrade for 24/7 usage
- Requires credit card

---

## 📊 Comparison Table

| Option | Cost | Uptime | Performance | Setup Difficulty | Best For |
|--------|------|--------|-------------|------------------|----------|
| **Oracle Cloud** | Free Forever | 99.9% | ⭐⭐⭐⭐ | Medium | Production |
| **Cloudflare Tunnel** | Free | Depends on PC | ⭐⭐⭐⭐⭐ | Easy | Development/Personal |
| **Render** | Free (limited) | Spins down | ⭐⭐⭐ | Easy | Testing |
| **Railway** | $5 credits/month | Good | ⭐⭐⭐⭐ | Easy | Development |

---

## 🚀 Detailed Setup Guides

### Oracle Cloud Setup

1. **Sign Up:**
   - Go to [cloud.oracle.com](https://cloud.oracle.com)
   - Create free account (no credit card needed in most regions)

2. **Create Instance:**
   - Navigate to "Compute" → "Instances"
   - Click "Create Instance"
   - Select "Ampere A1" shape (ARM)
   - Choose "Always Free Eligible"
   - Select 2 OCPU, 12 GB RAM (free tier limit)
   - Use Ubuntu 22.04 image
   - Create SSH key pair

3. **Connect and Install:**
   ```bash
   # SSH into your instance
   ssh opc@your-instance-ip
   
   # Install Ollama
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Start Ollama (accessible from internet)
   OLLAMA_HOST=0.0.0.0:11434 ollama serve &
   
   # Pull models
   ollama pull llama3.2
   ollama pull nomic-embed-text
   ```

4. **Configure Firewall:**
   - Go to "Networking" → "Security Lists"
   - Add ingress rule: Port 11434, Source 0.0.0.0/0

5. **Test:**
   ```bash
   curl http://your-instance-ip:11434/api/tags
   ```

6. **Keep Ollama Running:**
   ```bash
   # Use systemd service
   sudo nano /etc/systemd/system/ollama.service
   ```
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
   
   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   sudo systemctl enable ollama
   sudo systemctl start ollama
   ```

**Your Ollama URL:** `http://your-instance-ip:11434`

---

### Cloudflare Tunnel Setup

1. **Install Cloudflare Tunnel:**
   - Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
   - Or use: `brew install cloudflare/cloudflare/cloudflared` (Mac)
   - Or download binary for Windows/Linux

2. **Run Ollama Locally:**
   ```bash
   ollama serve
   ```

3. **Create Tunnel:**
   ```bash
   # Simple one-time tunnel
   cloudflared tunnel --url http://localhost:11434
   
   # This gives you a URL like:
   # https://abc123-def456.trycloudflare.com
   ```

4. **For Persistent URL (Optional):**
   ```bash
   # Login to Cloudflare
   cloudflared tunnel login
   
   # Create named tunnel
   cloudflared tunnel create ollama-backend
   
   # Configure tunnel
   cloudflared tunnel route dns ollama-backend ollama.yourdomain.com
   
   # Run tunnel
   cloudflared tunnel run ollama-backend
   ```

**Your Ollama URL:** `https://abc123.trycloudflare.com` (or your custom domain)

---

### Render Setup

1. **Create Account:**
   - Sign up at [render.com](https://render.com)
   - Verify email

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repo (or use shell)
   - Build command: `curl -fsSL https://ollama.com/install.sh | sh && ollama pull llama3.2 && ollama pull nomic-embed-text`
   - Start command: `OLLAMA_HOST=0.0.0.0:$PORT ollama serve`
   - Environment: `PORT=11434`

3. **Deploy:**
   - Render will build and deploy
   - First deployment takes ~5-10 minutes
   - Get your URL: `https://your-service.onrender.com`

**Note:** Service spins down after 15 min inactivity. First request will be slow.

---

## 💡 Recommendations

### For Production Use:
**→ Oracle Cloud Free Tier**
- Most reliable
- Always free
- Good performance

### For Development/Testing:
**→ Cloudflare Tunnel**
- Easiest setup
- No cloud account needed
- Full control

### For Quick Testing:
**→ Render Free Tier**
- Fastest to set up
- Good for demos
- Auto HTTPS

---

## ⚠️ Important Notes

1. **Security:**
   - All these options expose Ollama publicly
   - Consider adding authentication if handling sensitive data
   - Use firewall rules to restrict access if possible

2. **Performance:**
   - Free tiers have limited resources
   - Response times may be slower than paid options
   - Consider model size (llama3.2 is good for free tiers)

3. **Reliability:**
   - Free tiers may have downtime
   - Oracle Cloud is most reliable
   - Cloudflare Tunnel depends on your internet

4. **Costs:**
   - Oracle Cloud: Truly free (no hidden costs)
   - Cloudflare Tunnel: Free (uses your internet)
   - Render: Free but may require credit card
   - Railway: Free credits but may need upgrade

---

## 🔧 Quick Start Commands

### Oracle Cloud (After SSH):
```bash
curl -fsSL https://ollama.com/install.sh | sh
OLLAMA_HOST=0.0.0.0:11434 ollama serve &
ollama pull llama3.2
ollama pull nomic-embed-text
```

### Cloudflare Tunnel:
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Create tunnel
cloudflared tunnel --url http://localhost:11434
```

### Test Your Ollama:
```bash
curl http://your-ollama-url:11434/api/tags
```

---

## 📝 Next Steps

After setting up Ollama:

1. **Get your Ollama URL:**
   - Oracle: `http://your-ip:11434`
   - Cloudflare: `https://abc123.trycloudflare.com`
   - Render: `https://your-service.onrender.com`

2. **Set in Vercel:**
   ```
   OLLAMA_BASE_URL = http://your-ollama-url:11434
   ```

3. **Test connection:**
   ```bash
   curl http://your-ollama-url:11434/api/tags
   ```

4. **Deploy to Vercel** (see DEPLOY_VERCEL.md)

---

## 🆘 Troubleshooting

**"Connection refused"**
- Check firewall rules
- Verify Ollama is running: `ps aux | grep ollama`
- Check OLLAMA_HOST is set to 0.0.0.0

**"Model not found"**
- Pull models: `ollama pull llama3.2`
- Check available: `ollama list`

**"Timeout"**
- Free tiers may be slow
- Try smaller models
- Check instance resources

**"Out of memory"**
- Use smaller models
- Reduce context size
- Upgrade instance (if on free tier)

---

## 📚 Additional Resources

- [Ollama Documentation](https://github.com/ollama/ollama)
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Render Documentation](https://render.com/docs)


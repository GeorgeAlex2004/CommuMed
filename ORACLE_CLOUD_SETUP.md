# Complete Oracle Cloud Free Tier Setup Guide

This guide will walk you through setting up Ollama on Oracle Cloud's free tier - completely free forever!

## 📋 Prerequisites

- Email address (for Oracle Cloud account)
- SSH client (built into Mac/Linux, use PuTTY/WSL for Windows)
- 15-20 minutes

## Step 1: Create Oracle Cloud Account

1. **Go to Oracle Cloud:**
   - Visit: https://cloud.oracle.com
   - Click **"Start for Free"** or **"Sign Up"**

2. **Fill in Account Details:**
   - Enter your email
   - Choose a password
   - Enter your name and country
   - **No credit card required** ✅

3. **Verify Email:**
   - Check your email for verification link
   - Click to verify

4. **Complete Account Setup:**
   - Fill in company details (can use personal info)
   - Accept terms and conditions
   - Wait for account provisioning (may take a few minutes)

## Step 2: Create Free ARM Instance

### 2.1 Navigate to Compute

1. After login, you'll see the dashboard
2. Click the **☰ (hamburger menu)** in top left
3. Go to **"Compute" → "Instances"**

### 2.2 Create Instance

1. Click **"Create Instance"** button

2. **Basic Information:**
   - **Name:** `ollama-backend` (or any name you like)
   - **Placement:** Leave default

3. **Image and Shape:**
   - **Image:** Click **"Edit"** → Select **"Canonical Ubuntu"** → Choose **"Ubuntu 22.04"**
   - **Shape:** Click **"Edit"**
     - Select **"Ampere"** tab
     - Choose **"VM.Standard.A1.Flex"**
     - **OCPU Count:** `2` (free tier limit)
     - **Memory:** `12` GB (free tier limit)
     - Click **"Select Shape"**

4. **Networking:**
   - **Virtual Cloud Network:** Create new or use default
   - **Subnet:** Use default
   - **Public IP:** ✅ **Assign a public IPv4 address** (IMPORTANT!)

5. **Add SSH Keys:**
   - **Option A: Generate New Key Pair** (Easiest)
     - Click **"Save Private Key"** - **SAVE THIS FILE!** You'll need it to connect
     - Click **"Save Public Key"** (optional)
   - **Option B: Paste Your Public Key**
     - If you already have SSH keys, paste your public key here

6. **Review and Create:**
   - Review all settings
   - Make sure it shows **"Always Free Eligible"** ✅
   - Click **"Create"**

7. **Wait for Provisioning:**
   - Takes 2-5 minutes
   - Status will change from "Provisioning" to "Running"
   - **Copy the Public IP address** - you'll need it!

## Step 3: Configure Firewall (Security List)

### 3.1 Find Your VCN

1. Go to **"Networking" → "Virtual Cloud Networks"**
2. Click on your VCN (usually named like "vcn-..." or "Default VCN")

### 3.2 Add Security Rule

1. Click **"Security Lists"** in left sidebar
2. Click on **"Default Security List"**
3. Click **"Add Ingress Rules"** button

4. **Configure Rule:**
   - **Source Type:** CIDR
   - **Source CIDR:** `0.0.0.0/0` (allows from anywhere)
   - **IP Protocol:** TCP
   - **Destination Port Range:** `11434`
   - **Description:** `Ollama API Access`
   - Click **"Add Ingress Rules"**

## Step 4: Connect to Your Instance

### For Mac/Linux:

```bash
# Navigate to where you saved your private key
cd ~/Downloads  # or wherever you saved it

# Set correct permissions
chmod 400 your-private-key.key

# Connect (replace with your actual IP and key name)
ssh -i your-private-key.key opc@YOUR_PUBLIC_IP
```

### For Windows:

**Option 1: Using WSL (Windows Subsystem for Linux)**
```bash
# In WSL terminal
ssh -i /path/to/your-private-key.key opc@YOUR_PUBLIC_IP
```

**Option 2: Using PuTTY**
1. Download PuTTY: https://www.putty.org/
2. Convert key using PuTTYgen (comes with PuTTY)
3. Use PuTTY to connect:
   - Host: `opc@YOUR_PUBLIC_IP`
   - Port: `22`
   - Connection → SSH → Auth → Browse for your converted key

**Option 3: Using Windows Terminal with OpenSSH**
```powershell
# In PowerShell
ssh -i C:\path\to\your-private-key.key opc@YOUR_PUBLIC_IP
```

### First Connection

When you first connect, you'll see:
```
The authenticity of host '...' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
Type `yes` and press Enter.

You should now see:
```
[opc@ollama-backend ~]$
```

## Step 5: Install Ollama

Once connected, run these commands:

```bash
# Update system
sudo yum update -y

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version
```

## Step 6: Configure Ollama for Public Access

```bash
# Set environment variable to allow external access
export OLLAMA_HOST=0.0.0.0:11434

# Test Ollama starts
ollama serve &
```

Wait a few seconds, then test:
```bash
curl http://localhost:11434/api/tags
```

You should see: `{"models":[]}` (empty because no models yet)

## Step 7: Pull Required Models

```bash
# Pull the chat model (this takes 5-10 minutes)
ollama pull llama3.2

# Pull the embedding model (this takes 2-5 minutes)
ollama pull nomic-embed-text

# Verify models are installed
ollama list
```

You should see both models listed.

## Step 8: Create Systemd Service (Keep Ollama Running)

This ensures Ollama starts automatically and stays running:

```bash
# Create service file
sudo nano /etc/systemd/system/ollama.service
```

Paste this content:
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
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Save and exit:
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

Enable and start the service:
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (starts on boot)
sudo systemctl enable ollama

# Start service now
sudo systemctl start ollama

# Check status
sudo systemctl status ollama
```

You should see: `Active: active (running)`

## Step 9: Test from Your Computer

Open a new terminal on your local computer and test:

```bash
# Replace YOUR_PUBLIC_IP with your actual IP
curl http://YOUR_PUBLIC_IP:11434/api/tags
```

You should see your models listed:
```json
{
  "models": [
    {
      "name": "llama3.2:latest",
      ...
    },
    {
      "name": "nomic-embed-text:latest",
      ...
    }
  ]
}
```

## Step 10: Configure Vercel

Now that Ollama is running, add it to your Vercel environment variables:

1. Go to your Vercel project dashboard
2. Go to **Settings → Environment Variables**
3. Add these variables:

```
OLLAMA_BASE_URL = http://YOUR_PUBLIC_IP:11434
EMBEDDING_MODEL = nomic-embed-text
OLLAMA_MODEL = llama3.2
```

4. **Redeploy** your Vercel app for changes to take effect

## ✅ Verification Checklist

- [ ] Oracle Cloud account created
- [ ] ARM instance created and running
- [ ] Firewall rule added (port 11434)
- [ ] Connected via SSH
- [ ] Ollama installed
- [ ] Models pulled (llama3.2 and nomic-embed-text)
- [ ] Systemd service created and running
- [ ] Test from local computer works
- [ ] Vercel environment variables set
- [ ] Vercel app redeployed

## 🆘 Troubleshooting

### "Connection refused" when testing

1. **Check Ollama is running:**
   ```bash
   sudo systemctl status ollama
   ```

2. **Check firewall:**
   - Go to Oracle Cloud → Networking → Security Lists
   - Verify port 11434 is open

3. **Check OLLAMA_HOST:**
   ```bash
   # On the server
   echo $OLLAMA_HOST
   # Should show: 0.0.0.0:11434
   ```

4. **Restart Ollama:**
   ```bash
   sudo systemctl restart ollama
   sudo systemctl status ollama
   ```

### "Permission denied" when connecting

- Make sure you're using the correct private key
- Check key permissions: `chmod 400 your-key.key`
- Verify you're using `opc` as the username

### "Model not found"

- Pull models: `ollama pull llama3.2`
- List models: `ollama list`
- Check disk space: `df -h`

### Slow responses

- Free tier has limited resources
- This is normal for free tier
- Consider using smaller models if needed

### Instance stopped

- Free tier instances may stop if inactive
- Restart from Oracle Cloud dashboard
- Ollama will auto-start via systemd service

## 📝 Important Notes

1. **Public IP:** Your instance has a public IP that won't change unless you stop/terminate it
2. **Security:** Port 11434 is open to the world. Consider adding IP restrictions if needed
3. **Costs:** This setup is completely free and won't incur charges
4. **Backup:** Save your SSH private key securely - you'll need it to reconnect

## 🎉 You're Done!

Your Ollama backend is now running on Oracle Cloud Free Tier!

**Your Ollama URL:** `http://YOUR_PUBLIC_IP:11434`

Use this URL in your Vercel environment variables and you're all set!

## Next Steps

1. ✅ Test your Vercel deployment
2. ✅ Try asking questions in the chat interface
3. ✅ Monitor Ollama logs: `sudo journalctl -u ollama -f`

## Useful Commands

```bash
# Check Ollama status
sudo systemctl status ollama

# View Ollama logs
sudo journalctl -u ollama -f

# Restart Ollama
sudo systemctl restart ollama

# List models
ollama list

# Test Ollama locally
curl http://localhost:11434/api/tags

# Check system resources
htop
```

---

**Need Help?** Check the troubleshooting section or refer to [FREE_OLLAMA_HOSTING.md](./FREE_OLLAMA_HOSTING.md) for more details.


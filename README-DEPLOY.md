# 🚀 Nova Dev Contact Form Fix — Deployment Guide

## ⚡ Quick Fix Overview

This package fixes the **non-sending contact form** issue on `novadev-official.netlify.app` by implementing a robust Netlify serverless function with proper SMTP configuration.

---

## 📦 What's Included

```
novadev-fix/
├── netlify/
│   └── functions/
│       └── send-email/
│           ├── index.js         ← Serverless function (SMTP handler)
│           └── package.json     ← Nodemailer dependency
├── assets/
│   └── js/
│       └── main.js              ← Updated frontend with error handling
├── netlify.toml                 ← Build configuration
├── README-DEPLOY.md             ← This file
└── DIAGNOSTIC-CHECKLIST.md      ← Testing guide
```

---

## 🔧 The Fix

### **Root Cause**
The contact form was calling `/.netlify/functions/send-email`, but the function was failing due to:
1. **Wrong SMTP port** (AWS Lambda blocks port 25)
2. **Missing SSL/TLS configuration**
3. **Missing nodemailer package** in functions directory
4. **Environment variables not set** in Netlify dashboard

### **Solution**
✅ Robust SMTP with **port 465 (SSL) → 587 (STARTTLS) fallback**  
✅ Proper `nodemailer` bundling with `package.json` inside function directory  
✅ Beautiful HTML email templates (admin notification + client confirmation)  
✅ CORS headers for cross-origin fetch requests  
✅ Enhanced error handling with detailed messages  

---

## 📋 Step-by-Step Deployment

### **Option A: Update Existing Netlify Site (Recommended)**

If your site is already on Netlify and connected to GitHub:

#### **Step 1: Push Files to GitHub**

1. **Clone your existing repository** (if not already):
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Copy the fix files** into your repository:
   - Copy `netlify/` folder → into repository root
   - Copy `netlify.toml` → into repository root
   - Replace `assets/js/main.js` → with the updated version

3. **Commit and push**:
   ```bash
   git add netlify/ netlify.toml assets/js/main.js
   git commit -m "Fix: Contact form SMTP configuration with Netlify function"
   git push origin main
   ```

#### **Step 2: Install npm Dependencies in Functions Directory**

Before deploying, ensure `nodemailer` is installed in the function directory:

```bash
cd netlify/functions/send-email
npm install
cd ../../../
git add netlify/functions/send-email/package-lock.json
git add netlify/functions/send-email/node_modules/
git commit -m "Add nodemailer dependencies"
git push origin main
```

**OR** Let Netlify install it automatically (recommended) — just make sure `package.json` is in the right place.

#### **Step 3: Configure Environment Variables in Netlify**

🔑 **This is CRITICAL** — the function will fail without these:

1. Go to **Netlify Dashboard** → Your Site → **Site Settings**
2. Click **Environment Variables** (left sidebar)
3. Click **Add a variable** and add these **5 required variables**:

   | Variable Name      | Value                        |
   |--------------------|------------------------------|
   | `SMTP_HOST`        | `mail.novatvhub.com`         |
   | `SMTP_PORT`        | `465`                        |
   | `SMTP_USER`        | `admin@novatvhub.com`        |
   | `SMTP_PASS`        | `1allahArrahman`             |
   | `RECIPIENT_EMAIL`  | `admin@novatvhub.com`        |

4. Click **Save**

#### **Step 4: Trigger a New Deploy**

Netlify will auto-deploy when you push to GitHub. If not:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (~2-3 minutes)

#### **Step 5: Test the Form**

Go to `https://novadev-official.netlify.app` and:
1. Scroll to the **"🚀 Claim Your Free Website Audit"** form
2. Fill in all required fields
3. Click **"Get My Free Audit"**
4. You should see: ✅ **Success message** (green box)
5. Check your email (both admin and client should receive emails)

---

### **Option B: Fresh Deployment (New Site)**

If you want to deploy as a new site:

1. **Create a new GitHub repository**
2. **Upload all files** from this package to the repo
3. **Connect to Netlify**:
   - Go to Netlify Dashboard → **Add new site** → **Import from Git**
   - Select your GitHub repo
   - Build settings:
     - **Build command**: (leave empty)
     - **Publish directory**: `.` (root)
   - Click **Deploy**
4. **Set environment variables** (see Step 3 above)
5. **Redeploy**

---

## 🔍 Troubleshooting

### **Issue: Form still shows error after deployment**

**✅ Check 1: Environment Variables**
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
# Verify all 5 variables are set (SMTP_HOST, SMTP_PORT, etc.)
```

**✅ Check 2: Function Logs**
```bash
# In Netlify Dashboard → Functions tab → send-email
# Click on the function → View logs
# Look for errors like "ECONNREFUSED" or "Authentication failed"
```

**✅ Check 3: SMTP Server**
Test SMTP connection manually:
```bash
# From your local machine:
telnet mail.novatvhub.com 465
# If connection refused → SMTP server might be down or firewall blocking
```

**✅ Check 4: nodemailer Package**
```bash
# Check if nodemailer was installed:
# In function logs, you should NOT see "Cannot find module 'nodemailer'"
```

---

### **Issue: Emails not arriving**

1. **Check spam folder** (both admin and client inboxes)
2. **Check SMTP credentials**: Verify password is correct (`1allahArrahman`)
3. **Check email server logs**: Contact your SMTP provider (mail.novatvhub.com admin)
4. **Try port 587 instead of 465**:
   - In Netlify env vars, change `SMTP_PORT` to `587`
   - Redeploy

---

### **Issue: Function timeout**

If you see "Function execution timed out":
- Netlify functions have a **10-second timeout** (free tier)
- The function tries port 465, then falls back to 587 (takes ~5s)
- **Solution**: Hardcode the working port in `index.js`:
  ```javascript
  // Line ~40 in index.js
  const SMTP_PORT = 465; // or 587 — test which works
  ```

---

## 🧪 Testing Checklist

Use the separate **`DIAGNOSTIC-CHECKLIST.md`** file to systematically test:
- ✅ Function endpoint responds
- ✅ Form validation works
- ✅ Emails are sent successfully
- ✅ Error handling displays correctly

---

## 📞 Support

If you still experience issues after following this guide:

1. **Check Netlify function logs** (most issues are logged there)
2. **Contact SMTP provider** if connection fails
3. **Email**: admin@novatvhub.com
4. **Include**: 
   - Error message from form
   - Function logs from Netlify dashboard
   - Screenshot of environment variables (hide password)

---

## 🎯 What This Fix Does

### **Before** ❌
- Form submits but nothing happens
- No emails sent
- No error messages shown
- SMTP connection fails silently

### **After** ✅
- Form validates input on client side
- Beautiful loading state ("⏳ Sending...")
- Admin receives formatted email with all form details
- Client receives confirmation email
- Clear success/error messages
- Robust SMTP with port fallback (465 → 587)
- CORS enabled for fetch requests
- Detailed error logging for debugging

---

## 📄 File Details

### **`netlify/functions/send-email/index.js`**
- Full serverless function with nodemailer
- Port fallback strategy (465 SSL → 587 STARTTLS)
- Email validation
- Beautiful HTML email templates
- CORS headers
- Error handling

### **`netlify/functions/send-email/package.json`**
- Declares `nodemailer@^6.9.13` dependency
- Ensures Netlify installs it during build

### **`netlify.toml`**
- Build config: `functions = "netlify/functions"`
- Node bundler: `esbuild` (fast builds)
- Security headers
- CORS headers for API routes

### **`assets/js/main.js`**
- Updated `fetch` call to `/.netlify/functions/send-email`
- Better error handling (displays `result.error`)
- Client-side validation (email format, required fields)
- Loading state management
- Network error handling

---

## 🚀 Expected Result

After successful deployment:

1. **User fills form** → clicks submit
2. **Frontend validates** → shows "⏳ Sending..."
3. **Netlify function runs** → connects to SMTP (port 465 or 587)
4. **Two emails sent**:
   - 📧 Admin notification: `admin@novatvhub.com` receives beautifully formatted audit request
   - 📧 Client confirmation: User receives "Thank you" email
5. **Success message displayed**: ✅ Green box with confirmation
6. **Form resets** → ready for next submission

---

## ⚡ Quick Command Reference

```bash
# Clone your repo
git clone <repo-url>
cd <repo-name>

# Copy fix files (from this package)
cp -r novadev-fix/netlify ./
cp novadev-fix/netlify.toml ./
cp novadev-fix/assets/js/main.js ./assets/js/

# Install dependencies
cd netlify/functions/send-email
npm install
cd ../../../

# Commit and push
git add .
git commit -m "Fix: Contact form SMTP with Netlify function"
git push origin main

# Then: Set env vars in Netlify dashboard (see Step 3)
```

---

## 🎉 You're Done!

Once deployed with environment variables set, your contact form will work perfectly. Test it live on your Netlify site!

If you encounter any issues, refer to the **Troubleshooting** section or check **`DIAGNOSTIC-CHECKLIST.md`**.

---

**Built for Nova Dev**  
WordPress & Next.js Development | Digital Marketing  
🌐 novadev-official.netlify.app  
📧 admin@novatvhub.com

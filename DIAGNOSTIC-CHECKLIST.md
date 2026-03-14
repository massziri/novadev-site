# 🧪 Nova Dev Contact Form — Diagnostic Checklist

Use this checklist to systematically verify that the contact form fix is working correctly.

---

## ✅ Pre-Deployment Checklist

Before testing on the live site, verify these basics:

- [ ] **Files uploaded to GitHub repository**
  - `netlify/functions/send-email/index.js`
  - `netlify/functions/send-email/package.json`
  - `netlify.toml`
  - `assets/js/main.js` (updated version)

- [ ] **Netlify environment variables set**
  - `SMTP_HOST` = `mail.novatvhub.com`
  - `SMTP_PORT` = `465`
  - `SMTP_USER` = `admin@novatvhub.com`
  - `SMTP_PASS` = `1allahArrahman`
  - `RECIPIENT_EMAIL` = `admin@novatvhub.com`

- [ ] **Netlify site redeployed**
  - Check **Deploys** tab — latest deploy shows "Published"
  - No build errors in deploy logs

---

## 🔍 Test 1: Function Endpoint Exists

**Goal**: Verify the Netlify function is deployed and responding.

### Steps:
1. Open browser and navigate to:
   ```
   https://novadev-official.netlify.app/.netlify/functions/send-email
   ```
2. You should see (in JSON):
   ```json
   {"success":false,"error":"Method Not Allowed"}
   ```

### ✅ Pass Criteria:
- Response is **405 Method Not Allowed** (this is correct — function only accepts POST)
- You do NOT see "404 Not Found" (that means function isn't deployed)

### ❌ If Failed:
- **404 Error**: Function not deployed
  - Check `netlify.toml` has `functions = "netlify/functions"`
  - Check function folder structure: `netlify/functions/send-email/index.js`
  - Redeploy site
- **500 Error**: Function code error
  - Check Netlify function logs (Dashboard → Functions → send-email)

---

## 🔍 Test 2: Form Validation (Client-Side)

**Goal**: Verify frontend validation works before calling the function.

### Steps:
1. Go to https://novadev-official.netlify.app
2. Scroll to **"🚀 Claim Your Free Website Audit"** form
3. Click **"Get My Free Audit"** button **without filling anything**

### ✅ Pass Criteria:
- Red error box appears: ⚠️ "Please fill in all required fields..."
- Button text changes back to "Get My Free Audit" (not stuck on "Sending...")

### ❌ If Failed:
- Check browser console for JavaScript errors (F12 → Console tab)
- Verify `assets/js/main.js` was updated with the new validation code

---

## 🔍 Test 3: Email Format Validation

**Goal**: Verify invalid email addresses are rejected.

### Steps:
1. Fill the form with:
   - **First Name**: Test
   - **Email**: `invalidemail` (no @ symbol)
   - **Message**: Test message
2. Click **"Get My Free Audit"**

### ✅ Pass Criteria:
- Red error box appears: ⚠️ "Please enter a valid email address."
- Form does NOT submit (no network request sent)

### ❌ If Failed:
- Check `assets/js/main.js` has the `emailRegex` validation

---

## 🔍 Test 4: Successful Form Submission

**Goal**: Verify form submits and emails are sent successfully.

### Steps:
1. Fill the form completely with **real data**:
   - **First Name**: Your Name
   - **Last Name**: Your Last Name
   - **Email**: `your-real-email@example.com` (use your actual email!)
   - **Company**: Test Company
   - **Website**: example.com
   - **Phone**: +1 555 0100
   - **Service**: Website Redesign
   - **Message**: This is a test submission from the diagnostic checklist.

2. Click **"Get My Free Audit"**

3. **Watch for**:
   - Button text changes to "⏳ Sending..."
   - After 3-5 seconds: Green success box appears ✅
   - Form fields reset (cleared)

4. **Check your email inbox** (the email you entered):
   - Within 1-2 minutes, you should receive:
     - **Subject**: "✅ Your Website Audit Request Has Been Received!"
     - **From**: Nova Dev Team <admin@novatvhub.com>
     - Beautiful HTML email with confirmation

5. **Check admin inbox** (admin@novatvhub.com):
   - Should receive:
     - **Subject**: "🚀 New Audit Request: Test Company" (or your name)
     - **From**: Nova Dev Contact Form <admin@novatvhub.com>
     - Beautiful HTML email with all form details

### ✅ Pass Criteria:
- ✅ Success message displayed on site
- ✅ Client confirmation email received
- ✅ Admin notification email received
- ✅ Both emails are properly formatted (HTML with colors/styling)

### ❌ If Failed:
Go to **Troubleshooting** section below.

---

## 🔍 Test 5: Error Handling

**Goal**: Verify user-friendly error messages when something goes wrong.

### Steps:
1. Temporarily **break the function** to test error handling:
   - Option A: In Netlify Dashboard → Environment Variables → Change `SMTP_PASS` to `wrongpassword`
   - Option B: Change `SMTP_HOST` to `invalid.server.com`
2. Redeploy site (or wait for cache to clear)
3. Submit the form again with valid data

### ✅ Pass Criteria:
- Red error box appears with a clear message like:
  - ⚠️ "Email service temporarily unavailable..."
  - ⚠️ "Failed to send email..."
- Error message is **user-friendly** (not raw technical error)
- Button returns to normal state (not stuck on "Sending...")

### ❌ If Failed:
- Check `assets/js/main.js` has proper error handling in the `catch` block
- Check function returns `{ success: false, error: "..." }` on failure

### **Don't forget**: Restore the correct `SMTP_PASS` value after this test!

---

## 🔍 Test 6: Network Error Handling

**Goal**: Verify graceful handling when network fails.

### Steps:
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Enable **"Offline"** mode (throttling dropdown)
4. Fill and submit the form

### ✅ Pass Criteria:
- Red error box appears: ⚠️ "Network error. Please check your connection..."
- No browser console errors about unhandled promises

### ❌ If Failed:
- Check `assets/js/main.js` has a `try/catch` block around the `fetch` call

---

## 🔧 Troubleshooting Guide

### **Problem: No success message, no error message**

**Likely Cause**: JavaScript error preventing form submission

**Fix**:
1. Open browser console (F12 → Console)
2. Look for red error messages
3. Common issues:
   - `fetch is not defined` → Old browser (use Chrome/Firefox/Edge)
   - `Unexpected token` → Syntax error in `main.js`

---

### **Problem: Success message shows but NO emails received**

**Likely Cause**: SMTP authentication or connection failure

**Fix**:
1. Go to **Netlify Dashboard** → **Functions** tab
2. Click **send-email** function
3. Click **Function log** button
4. Look for errors:
   - `❌ SMTP connection failed` → SMTP server down or wrong credentials
   - `Authentication failed` → Wrong `SMTP_PASS`
   - `ECONNREFUSED` → Port blocked or wrong `SMTP_HOST`

**Solutions**:
- **Verify SMTP credentials**:
  ```
  Host: mail.novatvhub.com
  User: admin@novatvhub.com
  Pass: 1allahArrahman
  ```
- **Test SMTP server manually** (from local machine):
  ```bash
  telnet mail.novatvhub.com 465
  # Should connect successfully
  ```
- **Try port 587** instead of 465:
  - In Netlify env vars: `SMTP_PORT` = `587`
  - Redeploy

---

### **Problem: Function timeout (takes >10 seconds)**

**Likely Cause**: SMTP server slow to respond

**Fix**:
1. In `netlify/functions/send-email/index.js`, reduce timeout values:
   ```javascript
   connectionTimeout: 5000,  // was 8000
   greetingTimeout: 3000,    // was 5000
   socketTimeout: 5000,      // was 8000
   ```
2. Or hardcode the working port (skip fallback):
   ```javascript
   const SMTP_PORT = 465; // or 587 — whichever works
   ```

---

### **Problem: Emails go to spam folder**

**This is expected** — SMTP from `admin@novatvhub.com` may not have SPF/DKIM configured.

**Fix**:
1. **Short-term**: Check spam folder, mark as "Not Spam"
2. **Long-term**: Configure SPF/DKIM records for `novatvhub.com` domain
   - Contact your DNS/email provider
   - Add SPF record: `v=spf1 a mx ~all`
   - Add DKIM keys (provided by email host)

---

### **Problem: "Method Not Allowed" when submitting form**

**Likely Cause**: Form is sending GET instead of POST

**Fix**:
- Check `assets/js/main.js`:
  ```javascript
  method: 'POST',  // Must be POST, not GET
  ```

---

## 📊 Test Results Summary

After running all tests, fill in your results:

| Test | Status | Notes |
|------|--------|-------|
| 1. Function Endpoint | ⬜ Pass / ⬜ Fail | |
| 2. Form Validation | ⬜ Pass / ⬜ Fail | |
| 3. Email Validation | ⬜ Pass / ⬜ Fail | |
| 4. Successful Submission | ⬜ Pass / ⬜ Fail | |
| 5. Error Handling | ⬜ Pass / ⬜ Fail | |
| 6. Network Error | ⬜ Pass / ⬜ Fail | |

**All tests passed? 🎉 Your contact form is working perfectly!**

**Some tests failed?** → Use the Troubleshooting Guide above or check Netlify function logs.

---

## 🔗 Quick Links

- **Live Site**: https://novadev-official.netlify.app
- **Function Endpoint**: https://novadev-official.netlify.app/.netlify/functions/send-email
- **Netlify Dashboard**: https://app.netlify.com
- **Function Logs**: Dashboard → Functions → send-email → View logs

---

## 📞 Still Having Issues?

If you've tried everything and it still doesn't work:

1. **Export function logs**:
   - Netlify Dashboard → Functions → send-email → Download logs
2. **Take screenshots**:
   - Error message on form
   - Browser console (F12)
   - Environment variables (hide password)
3. **Email**: admin@novatvhub.com with:
   - Description of issue
   - Test results from this checklist
   - Function logs + screenshots

---

**Built for Nova Dev**  
WordPress & Next.js Development | Digital Marketing  
🌐 novadev-official.netlify.app  
📧 admin@novatvhub.com

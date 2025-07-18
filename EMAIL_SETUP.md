# 📧 Email Verification Setup Guide

## 🆓 **FREE Email Service Setup**

### **Option 1: Gmail SMTP (Recommended - FREE)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add to your `.env` file:**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-digit-app-password
   ```

### **Option 2: SendGrid (FREE - 100 emails/day)**

1. **Sign up at sendgrid.com**
2. **Get API key from dashboard**
3. **Update backend code to use SendGrid instead of Gmail**

### **Option 3: Mailgun (FREE - 5,000 emails/month)**

1. **Sign up at mailgun.com**
2. **Get API key from dashboard**
3. **Update backend code to use Mailgun**

## 🚀 **How Email Verification Works**

### **Signup Flow:**
1. User fills signup form
2. System sends 6-digit code to email
3. User enters code to verify
4. Account is created and user is logged in

### **Features:**
- ✅ **6-digit verification codes**
- ✅ **10-minute expiration**
- ✅ **Resend functionality**
- ✅ **Beautiful email templates**
- ✅ **Error handling**

## 💰 **Cost Analysis:**

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Gmail SMTP** | 500 emails/day | N/A |
| **SendGrid** | 100 emails/day | $14.95/month |
| **Mailgun** | 5,000 emails/month | $35/month |
| **Resend** | 3,000 emails/month | $20/month |

## 🔧 **Setup Instructions:**

1. **Add email credentials to `.env`:**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Restart your backend server**

3. **Test the signup flow:**
   - Go to your app
   - Click "Sign Up"
   - Enter your details
   - Check your email for verification code
   - Enter the code to complete signup

## 📧 **Email Template Preview:**

The verification email includes:
- ✅ Professional design
- ✅ Clear verification code
- ✅ 10-minute expiration notice
- ✅ SavakV2 branding

## 🛡️ **Security Features:**

- ✅ **Temporary code storage** (in-memory, expires in 10 minutes)
- ✅ **Rate limiting** (prevents spam)
- ✅ **Input validation**
- ✅ **Error handling**

## 🎯 **Next Steps:**

1. **Set up your email credentials**
2. **Test the signup flow**
3. **Monitor email delivery**
4. **Consider upgrading to paid service if needed**

**Total Cost: $0 (with Gmail SMTP)** 
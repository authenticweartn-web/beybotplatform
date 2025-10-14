# Facebook OAuth Setup Guide

This guide explains how to configure Facebook OAuth for BeyBot to enable Instagram and Messenger page linking.

## Prerequisites

1. A Facebook Developer account
2. A Facebook App created in the Facebook Developer Portal
3. Supabase project with authentication enabled

## Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in your app details:
   - App Name: "BeyBot"
   - App Contact Email: your email
   - Business Account: Select or create one

## Step 2: Configure Facebook Login

1. In your Facebook App dashboard, add "Facebook Login" product
2. Go to Facebook Login → Settings
3. Add OAuth Redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
   - Supabase callback: `https://your-project.supabase.co/auth/v1/callback`

## Step 3: Request Permissions

Your app needs the following permissions:
- `pages_show_list` - To list user's Facebook pages
- `pages_messaging` - To manage Messenger conversations
- `instagram_basic` - To access Instagram account info
- `instagram_manage_messages` - To manage Instagram DMs
- `pages_manage_metadata` - To manage page settings
- `business_management` - To access business accounts

These permissions require App Review from Facebook for production use.

## Step 4: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Facebook provider
4. Add your Facebook App credentials:
   - **Facebook App ID**: Found in your Facebook App dashboard
   - **Facebook App Secret**: Found in Settings → Basic in Facebook App dashboard
5. Add the Supabase callback URL to your Facebook App's OAuth settings

## Step 5: Set Environment Variables

Add these to your Vercel project or `.env.local`:

\`\`\`bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OAuth Redirect (for development)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## Step 6: Test the Integration

1. Run your app locally: `npm run dev`
2. Go to `/login`
3. Click "Continue with Facebook"
4. Authorize the app with your Facebook account
5. You should be redirected to `/dashboard/integrations`
6. Click "Sync Facebook Pages" to import your pages

## Important Notes

### Development vs Production

- **Development**: Facebook allows testing with app administrators, developers, and testers
- **Production**: Requires App Review approval for advanced permissions

### Token Management

- Facebook access tokens are stored securely in Supabase
- The `provider_token` is used to make Graph API calls
- Tokens are automatically refreshed by Supabase

### Permissions Scope

The app requests these scopes during login:
\`\`\`typescript
scopes: "pages_show_list,pages_messaging,instagram_basic,instagram_manage_messages,pages_manage_metadata,business_management"
\`\`\`

### Troubleshooting

**Error: "Invalid OAuth redirect URI"**
- Ensure the redirect URI in Facebook App matches exactly with your Supabase callback URL

**Error: "No Facebook access token found"**
- User needs to reconnect their Facebook account
- Check if the provider_token is being stored in the session

**Error: "Failed to sync pages"**
- Verify the user has admin access to Facebook pages
- Check if the access token has the required permissions
- Ensure the Facebook App has the necessary permissions approved

## Security Best Practices

1. Never commit Facebook App Secret to version control
2. Use environment variables for all sensitive credentials
3. Implement proper Row Level Security (RLS) in Supabase
4. Regularly rotate access tokens
5. Monitor API usage and rate limits

## Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Instagram Messaging API](https://developers.facebook.com/docs/messenger-platform/instagram)

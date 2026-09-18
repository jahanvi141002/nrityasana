# Meta WhatsApp Cloud API Setup

The backend supports Meta WhatsApp Cloud API webhook verification, inbound text synchronization, and optional outbound forwarding from the in-app chat.

## 1. Create Meta credentials

In Meta for Developers:

1. Create or open a Meta app.
2. Add the **WhatsApp** product.
3. In **API Setup**, copy the temporary or permanent access token and phone number ID.
4. In **Basic Settings**, copy the app secret.
5. Choose your own random webhook verify token. This is an application secret you create; it is not the Meta access token.
6. Add the recipient phone number to the WhatsApp test recipients while using development mode.

Do not commit any of these values.

## 2. Set backend environment variables

PowerShell example:

```powershell
$env:WHATSAPP_ACCESS_TOKEN = 'paste-token-in-your-terminal'
$env:WHATSAPP_PHONE_NUMBER_ID = '123456789012345'
$env:WHATSAPP_VERIFY_TOKEN = 'choose-a-long-random-value'
$env:WHATSAPP_APP_SECRET = 'paste-app-secret-in-your-terminal'
$env:WHATSAPP_DEFAULT_RECIPIENT = '919876543210'
```

`WHATSAPP_DEFAULT_RECIPIENT` is optional. When set, messages sent from the in-app Chat tab are also sent to that WhatsApp number. Use digits only with the country code.

## 3. Expose the local backend over HTTPS

Meta cannot call `localhost`. Use an HTTPS tunnel during local development, for example:

```powershell
ngrok http 8080
```

Copy the HTTPS forwarding URL, then use this callback URL in Meta:

```text
https://YOUR-NGROK-DOMAIN/api/whatsapp/webhook
```

For production, use the public HTTPS URL of the deployed backend instead of a tunnel.

## 4. Configure the Meta webhook

In the WhatsApp Webhooks configuration:

- Callback URL: `https://YOUR-DOMAIN/api/whatsapp/webhook`
- Verify token: exactly the value used in `WHATSAPP_VERIFY_TOKEN`
- Subscribe to `messages`

The backend validates both the verification token and `X-Hub-Signature-256` using `WHATSAPP_APP_SECRET`.

## Supported behavior

- Incoming WhatsApp text messages are added to the in-app Chat tab.
- In-app chat messages are forwarded to `WHATSAPP_DEFAULT_RECIPIENT` when WhatsApp credentials and a recipient are configured.
- Media, status, reactions, templates, and multi-recipient routing are not enabled yet.
- Chat and webhook state are currently in memory and should be moved to a database/queue for production.

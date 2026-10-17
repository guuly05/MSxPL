# Microsoft Foundry setup and connection

**Status:** App connector implemented; Azure subscription and Foundry resource are not connected from this workspace.

## Recommended configuration

The app is prepared for:

- **Resource:** One Microsoft Foundry resource and one model deployment.
- **Resource region:** East US 2.
- **Model:** GPT-6 Luna, using Global Standard serverless inference.
- **Deployment name:** gpt-6-luna (use the actual deployment name shown in your Foundry project if it differs).
- **App access:** The Node.js server calls Foundry. The browser never receives the API key.
- **Call behavior:** A model request runs only after a user presses the Foundry explanation button.

Global Standard inference can process prompts in any Azure region where the model is deployed. The demo sends synthetic match facts only. The model is listed as generally available across Global Standard regions and requires no access request in the current Microsoft documentation. Check the exact subscription quota and deployment availability inside your account before creating it. [Model availability](https://learn.microsoft.com/azure/foundry/openai/how-to/reasoning) [Deployment regions](https://learn.microsoft.com/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure-region-availability?pivots=standard)

## Current cost basis

Microsoft's October 15, 2026 Foundry update lists GPT-6 Luna Global Standard short-context rates at **$0.10 per million input tokens** and **$0.50 per million output tokens**. Long-context rates are higher; check the live price link before deployment. [Microsoft Foundry pricing update](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-september-2026/)

At those published rates, an illustrative request using 500 input tokens and the app's 220-token output cap costs about **$0.00016**. One thousand similarly sized requests would be about **$0.16**. Actual cost depends on token counts, model routing, and the current rate. The app makes requests only when a user presses the button.

Microsoft documentation says serverless model deployments and their resource have no separate fixed deployment charge, while inference is billed by token. This is not a guarantee that every Azure component or subscription has zero cost. [Foundry billing FAQ](https://learn.microsoft.com/en-us/azure/foundry-classic/foundry-models/faq)

## Azure for Students offer

Microsoft currently advertises Azure for Students with $100 in credit, no credit card, and student verification through a school email. Credit expires after 12 months; after the credit is exhausted, the subscription can be disabled unless upgraded. Marketplace offers are excluded from the credit. Confirm the offer and remaining balance in your own subscription before using it. [Azure for Students](https://azureforeducation.microsoft.com/en-us/Student) [Credit expiration and subscription behavior](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/azurestudents-subscription-disabled)

Do not upgrade to Pay-As-You-Go unless you deliberately choose to accept that billing arrangement.

## Create the Foundry resource

1. Sign in to the [Azure portal](https://portal.azure.com) with the Microsoft account that owns your Azure subscription.
2. Open Microsoft Foundry and create a project in East US 2, or use an existing suitable project.
3. Select GPT-6 Luna and create a Global Standard serverless deployment. Confirm the live price, quota, processing terms, and subscription shown in the portal before selecting Create.
4. Record the resource endpoint and the deployment name. Do not share or paste the key into chat.
5. In the project’s Keys and Endpoint view, create or copy an API key only if needed for local development. A production deployment should use managed identity/Entra ID instead of a long-lived key.

Microsoft's current OpenAI-compatible Foundry endpoint uses the resource base URL followed by /openai/v1/chat/completions. The model request uses the deployment name in the model field. [REST quickstart](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/how-to/use-foundry-models-grok) [API reference](https://learn.microsoft.com/en-us/azure/foundry/openai/latest)

## Connect the app locally

1. Copy .env.example to .env in the project root.
2. Add the resource endpoint, API key, and deployment name to .env:

~~~env
AZURE_FOUNDRY_ENDPOINT=https://YOUR-RESOURCE.services.ai.azure.com
AZURE_FOUNDRY_API_KEY=YOUR-LOCAL-KEY
AZURE_FOUNDRY_DEPLOYMENT=gpt-6-luna
AI_REQUESTS_PER_MINUTE=8
~~~

3. Restart the local app with npm run dev.
4. Confirm the header shows FOUNDRY READY.
5. Finish one match replay and press Generate with Microsoft Foundry. Check the result and Azure Cost Management after the call.
6. Keep .env private. It is excluded by .gitignore. Never commit it or place the key in frontend code.

## What is still needed from you

This desktop session had no Azure CLI installation, no Azure login, and no open Azure portal session, so I could not inspect your subscription, activate a student offer, create a Foundry resource, or connect a real key. The app connector is ready for the values above.

To finish the real connection, you will need to:

- Sign in to Azure and confirm the subscription and credit balance.
- Create the Foundry resource and GPT-6 Luna deployment described above after reviewing the live costs and data-processing details.
- Put the endpoint, key, and deployment name into your local .env file.
- Tell me when the values are configured (do not send the key). I can then help verify the connection from the app.

Before creating any Azure resource, the exact resource, region, cost basis, and purpose must be approved. This document records that proposed configuration; it does not create resources or grant an approval.

## Before public deployment

The current app is local-first. Hosting the app publicly would add compute, networking, and possibly logging costs. Public deployment also requires a hosting provider, region, security review, managed identity, rate-limit policy, and budget monitoring. Estimate those separately and approve them before deployment.

# Smart Reels

Smart Reels is a self-hosted, short-form video feed designed for curated, educational content. It allows users to build a personalized feed from specific YouTube channels, filtering out noise and focusing on intellectually valuable videos.

![Smart Reels Demo](https://placehold.co/800x450/1a1a1a/ffffff?text=Smart+Reels+App+Demo.gif)

## Core Features

- **Vertical Video Feed**: A scroll-snap interface for browsing content. Videos load and play when in view.
- **User-Managed Curation**: Users can add or remove YouTube channels to source content from. The UI supports adding channels in bulk by pasting multiple URLs.
- **Authentication**: User accounts are handled by Supabase Auth.
- **"Seen" Video Tracking**: Tracks viewed videos per user and hides them from the main feed by default. This can be toggled in the filter menu.
- **Automated Content Ingestion**: A backend worker, designed to run as a cron job, periodically fetches new videos from the curated channels.
- **Filtering**: Content can be filtered by source, tags, and duration.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Backend & Database**: Supabase (PostgreSQL, Auth)
- **Styling**: Tailwind CSS
- **UI/Animation**: Framer Motion, Lucide React
- **Deployment**: Vercel (with Serverless Cron Jobs)
- **API**: YouTube Data API v3

---

## Deployment & Setup

You can deploy this project to Vercel and set up the Supabase backend by following these steps.

### 1. Fork & Clone the Repository

First, fork this repository to your own GitHub account, then clone it to your local machine.

```sh
git clone [https://github.com/your-username/smart-reels.git](https://github.com/your-username/smart-reels.git)
cd smart-reels
```

### 2. Set Up the Supabase Project

1.  **Create Project**: Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Run SQL Schema**: Navigate to the **SQL Editor** in your new project. Copy the entire content of the `schema.sql` file from this repository and run it. This will create all the necessary tables and policies.
3.  **Enable Auth Providers**: Go to **Authentication > Providers** and enable the **Email** provider. You can also enable social providers like Google or GitHub if you wish.

### 3. Set Up the Vercel Project

1.  **Import Project**: Go to [Vercel](https://vercel.com/) and create a new project. Import the repository you forked. Vercel will automatically detect that it is a Next.js project.
2.  **Configure Environment Variables**: Before deploying, go to the project's **Settings > Environment Variables**. You will need to add the keys from the table below.

### 4. Environment Variables

These variables are required for the application to connect to Supabase and the YouTube API.

| Variable Name                 | Where to Find                                                                      | Description                                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`    | Supabase Dashboard: **Settings > API > Project URL** | The public URL for your Supabase project. Safe to expose on the client-side.                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard: **Settings > API > Project API Keys > `anon` `public`** | The public anonymous key for your Supabase project. Safe to expose on the client-side.                  |
| `SUPABASE_SERVICE_ROLE_KEY`   | Supabase Dashboard: **Settings > API > Project API Keys > `service_role` `secret`** | The secret service role key. **Never expose this on the client-side.** Used for admin tasks on the backend. |
| `YOUTUBE_API_KEY`             | [Google Cloud Console](https://console.cloud.google.com/apis/credentials)          | Your API key for the YouTube Data API v3. Required for the backend worker to fetch video data.          |

### 5. Deploy

Once the environment variables are set, go to the **Deployments** tab in Vercel and trigger a new deployment. Vercel will build and deploy your application. The cron job defined in `vercel.json` will be automatically scheduled.

---

## Local Development

If you wish to run the project locally, follow the same setup steps for Supabase, then:

1.  **Create `.env.local` file**: Create a file named `.env.local` in the project root and add the same environment variables you added to Vercel.
2.  **Install Dependencies & Run**:
    ```sh
    npm install
    npm run dev
    ```
3.  **Manual Worker Execution**: To test the backend ingestion immediately, run:
    ```sh
    npx ts-node -r dotenv/config scripts/youtube_worker.ts
    ```

## Contributing

Contributions, issues, and feature requests are welcome. Please check the [issues page](https://github.com/your-username/smart-reels/issues) to get started.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

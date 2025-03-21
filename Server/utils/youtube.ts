import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new OAuth2Client(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URL
);

// Set credentials
oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
});

const youtube = google.youtube('v3');

export const uploadVideoToYoutube = async (
    videoFile: any,
    title: string,
    description: string
) => {
    try {
const response = await youtube.videos.insert({
            auth: oauth2Client,
    part: ['snippet', 'status'],
    requestBody: {
        snippet: {
                    title,
                    description,
        },
        status: {
                    privacyStatus: 'public'
                }
        },
    media: {
                body: videoFile
            }
});

        return {
            videoId: response.data.id,
            videoUrl: `https://www.youtube.com/watch?v=${response.data.id}`
};
    } catch (error: any) {
        throw new Error(`Failed to upload video: ${error.message}`);
    }
};

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Client } from "@notionhq/client";

dotenv.config();

export default async (req, res) => {
    const token = process.env.ENV_NOTION_TOKEN;
    const databaseId = process.env.ENV_DATABASE_ID;

    const notion = new Client({ auth: token })

    const data = await notion.databases.query({
        database_id: databaseId
    })

    const processedData = processData(data.results);
    res.json(processedData);
};

const processData = (data) => {
    const progressMap = new Map();

    data.forEach(item => {
        if (item.properties.Date && item.properties.Progress) {
            if (item.properties.Progress.number !== null && item.properties.Progress.number > 0) {
                const dateObject = new Date(item.properties.Date.date.start);
                const date = dateObject.toISOString().split('T')[0]; // Format back to YYYY-MM-DD
                const progress = Math.round(item.properties.Progress.number * 100); // Convert from 0-1 to 0-100
                progressMap.set(date, progress);
            }
        }
    });

    return Array.from(progressMap).map(([date, progress]) => ({ date, progress }));
};

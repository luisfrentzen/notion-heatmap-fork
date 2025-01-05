import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Client } from "@notionhq/client";

dotenv.config();

export default async (req, res) => {
    const token = process.env.ENV_NOTION_TOKEN;
    const databaseId = process.env.ENV_DATABASE_ID;
    const qDatabaseId = process.env.ENV_Q_DATABASE_ID;

    const notion = new Client({ auth: token })

    const data = await notion.databases.query({
        database_id: databaseId
    })

    const qdata = await notion.databases.query({
        database_id: qDatabaseId
    })

    const processedData = processData(data.results, qdata.results);
    res.json(processedData);
};

const processData = (data, qdata) => {
    const progressMap = new Map();

    data.forEach(item => {
        if (item.properties.Date) {
            const dateObject = new Date(item.properties.Date.date.start);
            const date = dateObject.toISOString().split('T')[0]; // Format back to YYYY-MM-DD
            if (!progressMap.has(date)) {
                progressMap.set(date, 20);
            }
            progressMap.set(date, progressMap.get(date) + 20);
        }
    });

    qdata.forEach(item => {
        if (item.properties.Date) {
            const dateObject = new Date(item.properties.Date.date.start);
            const date = dateObject.toISOString().split('T')[0]; // Format back to YYYY-MM-DD
            if (!progressMap.has(date)) {
                progressMap.set(date, 20);
            }
            progressMap.set(date, progressMap.get(date) + 20);

            console.log(item.properties)
            
            dateObject = new Date(item.properties.ResolveDate.date.start);
            date = dateObject.toISOString().split('T')[0]; // Format back to YYYY-MM-DD
            if (!progressMap.has(date)) {
                progressMap.set(date, 20);
            }
            progressMap.set(date, progressMap.get(date) + 20);
        }
    });

    return Array.from(progressMap).map(([date, progress]) => ({ date, progress }));
};

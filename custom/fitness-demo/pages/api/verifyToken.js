export default async function handler(req, res) {

    const { token } = req.query;
    if (req.method === 'GET') {
        const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
        };
    
        const dailyRes = await fetch(
        `${
            process.env.DAILY_REST_DOMAIN || 'https://api.daily.co/v1'
        }/meeting-tokens/${token}`,
        options
        );
      
        return res.status(200).json(await dailyRes.json());
    }
    
    return res.status(500);
    }

export default async function handler(req, res) {
    const { roomName, userId } = req.body;
    
    if (req.method === 'POST' && roomName) {
        console.log(`Getting token for room '${roomName}' as participant :${userId}`);

        const dailyRes = await fetch('http://localhost:5000/api/links/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Allow-Control-Allow-Origin': '*'
            },
            body: {
                "roomName": roomName,
                "userId": userId
            }
    }
        );
        console.log(dailyRes)
        const { token, error } = await dailyRes.json();
    
        if (error) {
        return res.status(500).json({ error });
        }
    
        return res.status(200).json({ token});
    }
    
    return res.status(500);
    }
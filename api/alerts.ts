import { IncomingMessage, ServerResponse } from 'http';

// In-memory store for active alerts (Ephemeral)
// In a full production app, replace this with Redis (Vercel KV) or a Database.
let activeAlerts: any[] = [];

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Prune alerts older than 5 minutes
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000;
  activeAlerts = activeAlerts.filter(a => new Date(a.timestamp).getTime() > fiveMinsAgo);

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const newAlert = {
          ...data,
          id: Date.now().toString() + Math.random().toString().slice(2),
          timestamp: new Date().toISOString(),
        };
        
        // Add to store
        activeAlerts.push(newAlert);
        
        // Keep store size manageable
        if (activeAlerts.length > 50) activeAlerts.shift();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newAlert));
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'DELETE') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { id } = JSON.parse(body);
        if (id) {
          activeAlerts = activeAlerts.filter(a => a.id !== id);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } else {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing ID' }));
        }
      } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(activeAlerts));
    return;
  }

  res.statusCode = 405;
  res.end();
}
import express from 'express';
import { downloadYouTube } from '../youtube/download.js';
import yts from 'yt-search';

async function getUrl(query) {
  // Fetch results
  const { videos } = await yts(query);

  // Grab the first video's URL
  const firstUrl = videos[0]?.url;

  if (firstUrl) {
    return firstUrl;
  } else {
    return 'No results found.';
  }
}

// Helper to get correct base URL (proxy-aware)
function getBaseUrl(req) {
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    
    // If host contains the actual domain, use it directly
    if (host && !host.includes('localhost')) {
        return `https://${host}`;
    }
    
    return `${protocol}://${host}`;
}

const router = express.Router();

router.get("/",(req, res) => {
    res.json({"Luthor": "Finger Print"});
});

// Query endpoint - search YouTube, download, and return media URL
router.post("/query", async (req, res) => {
    const { query, format } = req.body;
    
    if (!query || !format) {
        return res.status(400).json({ 
            error: "You need to provide both query and format" 
        });
    }
    
    try {
        // Step 1: Search for URL
        const url = await getUrl(query);
        
        if (url === 'No results found.') {
            return res.status(404).json({
                success: false,
                error: "No results found for your query"
            });
        }
        
        // Step 2: Download the video
        const result = await downloadYouTube(url, format);
        
        if (result.success) {
            // Construct dynamic URL
            const baseUrl = getBaseUrl(req);
            const fileUrl = `${baseUrl}/media/${result.filename}`;
            
            return res.json({
                success: true,
                query: query,
                filename: result.filename,
                downloadUrl: fileUrl
            });
        } else {
            return res.status(500).json({
                success: false,
                error: result.error
            });
        }
        
    } catch (error) {
        console.error('Query error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Download endpoint
router.post("/download", async (req, res) => {
    const { url, format } = req.body;
    
    if (!url || !format) {
        return res.status(400).json({ 
            error: "You need to provide both url and format" 
        });
    }
    
    try {
        const result = await downloadYouTube(url, format);
        
        if (result.success) {
            // Construct dynamic URL
            const baseUrl = getBaseUrl(req);
            const fileUrl = `${baseUrl}/media/${result.filename}`;
            
            return res.json({
                success: true,
                filename: result.filename,
                downloadUrl: fileUrl
            });
        } else {
            return res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Download error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
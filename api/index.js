export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    status: 'online', 
    message: 'Lina App API is running',
    endpoints: ['/api/products', '/api/categories'] 
  });
}
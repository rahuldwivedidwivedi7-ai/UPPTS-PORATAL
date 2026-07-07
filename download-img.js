const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Signature_Building_HQ_UP_Police.jpg';
const dest = 'frontend/public/assets/signature-building.jpg';

const file = fs.createWriteStream(dest);

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

https.get(url, options, function(response) {
  if(response.statusCode !== 200) {
     console.error('Failed to download: ' + response.statusCode);
     return;
  }
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log('Download complete');
  });
}).on('error', function(err) {
  fs.unlink(dest);
  console.error('Error downloading:', err.message);
});

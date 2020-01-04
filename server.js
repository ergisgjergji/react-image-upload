const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs'); 

const app = express();

app.use(fileUpload());

// Upload Endpoint
app.post('/upload', (req, res) => {
    if(req.files === null) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }

    const file = req.files.file;
    let path = `${__dirname}/client/public/uploads/${file.name}`;

    fs.access(path, fs.F_OK, (err) => {
        if (err) 
        {
          // File doesnt exist - upload it
          file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
                if(err) {
                    console.log(err);
                    return res.status(500).send(err);
                }
        
                res.json({ fileName: file.name, filePath: `uploads/${file.name}` });
            });
        }
        else 
        {
            return res.status(400).json({ message: 'File already exists.' });
        }
      });
});

app.listen(5000, () => console.log('Server running on port 5000...'));
const express = require('express');
const { createObjectCsvWriter } = require('csv-writer');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Create a CSV writer to append messages to the CSV file
const csvWriter = createObjectCsvWriter({
    path: 'user_messages.csv',
    header: [
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'message', title: 'Message' },
    ],
    append: true,
});

// POST endpoint to log message and run sentiment analysis
app.post('/logMessage', (req, res) => {
    const { message } = req.body;
    const timestamp = new Date().toISOString();

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Write the message to the CSV file
    csvWriter
        .writeRecords([{ timestamp, message }])
        .then(() => {
            console.log(`Message logged: ${message}`);

            // Run Python sentiment analysis script
            exec('python sentiment_analysis.py', (err, stdout, stderr) => {
                if (err) {
                    console.error('Error running sentiment analysis:', stderr);
                    return res.status(500).json({ error: 'Sentiment analysis failed' });
                }

                try {
                    const analysisResult = JSON.parse(stdout);
                    res.status(200).json(analysisResult);
                } catch (parseError) {
                    console.error('Error parsing Python output:', parseError);
                    res.status(500).json({ error: 'Failed to process analysis result' });
                }
            });
        })
        .catch((err) => {
            console.error('Error writing to CSV:', err);
            res.status(500).json({ error: 'Failed to log message' });
        });
});

app.listen(5000, () => {
    console.log('Server running at http://localhost:5000');
});

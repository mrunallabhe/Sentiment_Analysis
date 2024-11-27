import csv
import json
from textblob import TextBlob

def analyze_csv():
    try:
        # Read the CSV file containing user messages
        with open('user_messages.csv', 'r') as file:
            reader = csv.DictReader(file)
            if 'Message' not in reader.fieldnames:
                return json.dumps({"error": "The 'Message' column is missing from the CSV file"})

            messages = [row['Message'] for row in reader]

        if messages:
            # Analyze sentiment of the most recent message
            last_message = messages[-1]
            blob = TextBlob(last_message)
            polarity = blob.sentiment.polarity

            sentiment = "positive" if polarity > 0 else "negative" if polarity < 0 else "neutral"
            mood = "happy" if polarity > 0 else "sad" if polarity < 0 else "neutral"

            return json.dumps({
                "sentiment": sentiment,
                "mood": mood
            })
        else:
            return json.dumps({"error": "No messages found in the CSV file"})
    except FileNotFoundError:
        return json.dumps({"error": "The CSV file does not exist"})
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    print(analyze_csv())


document.getElementById('input_button').addEventListener('click', async () => {
  const dataInput = document.getElementById('input-container').value; //should be data from database
  const responseDiv = document.getElementById('user1');


  if (userInput) {
      responseDiv.textContent = 'Loading...';

      // ChatGPT API endpoint
      const apiUrl = 'https://api.openai.com/v1/chat/completions';

      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer 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'
              },
              body: JSON.stringify({
                  model: "gpt-4",
                  messages: [{ role: "user", content: "given the following data, which are questions and answers from 2 family members, ask a question that will help them get to know each other on a deeper level:" + dataInput }],
                  max_tokens: 1000
              })
          });

          if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
          }

          const data = await response.json();

          // Check if data and choices are defined
          if (data && data.choices && data.choices.length > 0) {
              responseDiv.textContent = data.choices[0].message.content.trim();
              await addDoc(collection(db, 'responses'), {
                input: dataInput,
                response: data.choices[0].message.content.trim(),
                timestamp: new Date()
            });
          } else {
              responseDiv.textContent = 'No response from API.';
              console.error('Unexpected API response:', data);
          }
      } catch (error) {
          responseDiv.textContent = 'Error: ' + error.message;
          console.error('Fetch error:', error);
      }
  } else {
      responseDiv.textContent = 'Please enter a query.';
  }
});

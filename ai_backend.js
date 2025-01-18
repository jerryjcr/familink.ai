document.getElementById('submitButton').addEventListener('click', async () => {
  const dataInput = document.getElementById('userInput').value; //database input
  const responseDiv = document.getElementById('response');

  if (userInput) {
      responseDiv.textContent = 'Loading...';

      // ChatGPT API endpoint
      const apiUrl = 'https://api.openai.com/v1/chat/completions';

      try {
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'api key'  // Replace with your actual API key
              },
              body: JSON.stringify({
                  model: "gpt-4",  // Specify the model you want to use
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
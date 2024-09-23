document.getElementById("checkButton").addEventListener("click", function () {
  const textInput = document.getElementById("textInput").value.trim();
  
  if (!textInput) {
    document.getElementById("result").innerHTML = "<p>Please enter some text to check.</p>";
    return;
  }

  // Add the text to the URL as a query parameter
  const currentUrl = new URL(window.location);
  currentUrl.searchParams.set('text', encodeURIComponent(textInput));
  window.history.pushState({}, '', currentUrl);

  // Call function to check grammar
  checkGrammar(textInput);
});

// On page load, check if there's text in the URL parameter and run the grammar check automatically
window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const savedText = urlParams.get('text');
  
  if (savedText) {
    const decodedText = decodeURIComponent(savedText);
    document.getElementById("textInput").value = decodedText;
    checkGrammar(decodedText);
  }
};

// Function to check grammar using the LanguageTool API
async function checkGrammar(text) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>Checking for grammar mistakes...</p>";

  // LanguageTool API endpoint
  const apiUrl = "https://api.languagetool.org/v2/check";

  try {
    // Send the text to LanguageTool API for grammar checking
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: text,
        language: "en-US",
      }),
    });

    const data = await response.json();

    if (data.matches.length === 0) {
      resultDiv.innerHTML = "<p>No grammar mistakes found!</p>";
      return;
    }

    // Display the grammar issues without bullet points
    let output = "<h3>Suggestions:</h3>";
    data.matches.forEach((match) => {
      const from = match.offset;
      const to = from + match.length;
      const issue = text.substring(from, to);

      output += `<div><span class="suggestion">${issue}</span>: ${match.message}<br>Suggested replacement: <span class="replacement">${match.replacements.map(r => r.value).join(', ')}</span></div>`;
    });

    resultDiv.innerHTML = output;

  } catch (error) {
    resultDiv.innerHTML = "<p>There was an error checking the text. Please try again later.</p>";
    console.error("Error:", error);
  }
}

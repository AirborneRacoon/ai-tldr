// contentScript.ts

function extractArticleText(html: string): string[] {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const articleElement = doc.querySelector('article');
    if (!articleElement) {
      throw new Error('Could not find article element');
    }
    const textNodes = Array.from(articleElement.querySelectorAll('h1, h2, h3, h4, h5, p, ul, ol, li'))
                          .map(node => node.textContent);
    const allText = textNodes.join(' ').trim();
    const sentences = allText.split(/(?<=[.?!])\s+/);
    const uniqueSentences = Array.from(new Set(sentences));
    const textWithoutDuplicates = uniqueSentences.join(' ');
    const chunks = [];
    let start = 0;
    let end = 0;
    while (start < textWithoutDuplicates.length) {
      end = Math.min(start + 900, textWithoutDuplicates.length);
      if (end < textWithoutDuplicates.length) {
        while (end > start && textWithoutDuplicates[end] !== '.') {
          end--;
        }
      }
      chunks.push(textWithoutDuplicates.slice(start, end));
      start = end + 1;
    }
    return chunks;
  }

  async function extractTextFromResponse(response: Response): Promise<string> {
    if (!response.ok) {
      throw new Error(`Received error status ${response.status} (${response.statusText}) from server`);
    }
    
    const responseBody = await response.json();
    return responseBody.choices[0].text;
  }
  

  async function processTextChunks(html: string): Promise<string> {
    let responseText = '';
    
    try {
      const chunks = extractArticleText(html);
      console.log ('extracted the article text:'.concat(combineTextChunks(chunks)))
      
      for (const chunk of chunks) {
        const response = await makeApiRequest(chunk);
        console.log(response);
        responseText += "\n" + response.choices[0].text;
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
    }
    
    console.log(responseText);
    return responseText;
    } catch (error: unknown) {
      if (typeof error === 'string') {
        console.error(`Error: ${error}`);
      } else if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error(`Error: ${error}`);
      }
    }
    return 'Error: See console logs';
  }

  function combineTextChunks(chunks: string[]): string {
    return chunks.join('.\n\n');
  }  
  
  async function handleButtonClick() {
    try {
        const html = document.documentElement.outerHTML;

        const articleElement = document.querySelector('article');
        if (!articleElement) {
        throw new Error('Could not find article element');
        }

        const divElement = document.createElement('div');
        divElement.style.minHeight = '100px';
        divElement.style.width = '100%';
        divElement.style.border = '3px solid black';
        articleElement.insertBefore(divElement, articleElement.firstChild);

        const articleSummary = await processTextChunks(html);
        divElement.innerText = articleSummary;
    } catch (error: unknown) {
        if (typeof error === 'string') {
        console.error(`Error: ${error}`);
        } else if (error instanceof Error) {
        console.error(`Error: ${error.message}`);

        const articleElement = document.querySelector('article');
        if (!articleElement) {
            throw new Error('Could not find article element');
        }

        const divElement = document.createElement('div');
        divElement.style.minHeight = '100px';
        divElement.style.width = '100%';
        divElement.style.border = '3px solid black';
        articleElement.insertBefore(divElement, articleElement.firstChild);

        divElement.innerText = error.message;
        } else {
        console.error(`Error: ${error}`);
        }
    }
}

  
  function createButton() {
    const button = document.createElement('button');
    button.style.backgroundColor = 'red';
    button.style.position = 'fixed';
    button.style.zIndex = '9999'
    button.style.top = '10px';
    button.style.right = '10px';
    button.textContent = 'Extract Article Text';
    button.onclick = handleButtonClick;
    document.body.appendChild(button);
  }
  
  createButton();


  async function makeApiRequest(prompt: String): Promise<any> {
    const APItext = prompt.concat('\n\nTl;dr');
    
    const requestOptions = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer API_KEY'
    },
      body: JSON.stringify({
        model: 'text-davinci-001',
        prompt: APItext,
        temperature: 0.7,
        max_tokens: 65,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 1
      })
    };
  
    const response = await fetch('https://api.openai.com/v1/completions', requestOptions);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  }
  
# ai-tldr
makes OpenAI generate a summary of the article currently being read and is entirely written using ChatGPT prompts.

## Todo
- Currently breaks text into chunks based on character length. In the future, it should parse each heading and keep reading until it reaches the next heading. That should constitute a 'chunk,' which can then be summarized. This will require dynamic token settings. 
- Then each summary shall be summarized by OpenAI, such that the end TL;DR is approximately 1 paragraph.

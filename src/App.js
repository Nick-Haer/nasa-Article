import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import article from './perseverance.js';

function App() {
  const [articleData, setArticleData, modal] = useState({
    article,
    stringsArr: [],
    concepts: [],
    conceptText: '',
  });

  let { stringsArr, conceptText, concepts } = articleData;

  //called when the page load for the first time
  useEffect(() => {
    parseSentence();
    articleData.article.results.forEach(sentence => {});
  }, []);

  const handleMouseover = (e, count) => {
    // finds the concept classification that matches the correct string
    const conceptText = concepts.filter((concept, index) => index === count)[0];
    setArticleData({ ...articleData, conceptText });
  };

  // A function built to turn the start token and token length into a series of strings, each of which is notated as either an entity or not.
  const parseSentence = () => {
    // stringArr will hold an array of objects, each of which contains a substring, and notation as to whether it is an entity or not.
    const stringsArr = [];
    // conceptsArr will hold an array of concept classifications.
    const conceptsArr = [];
    // keeps track of entities to later match them to their classification
    let entityCount = 0;

    for (let sentence of articleData.article.results) {
      // loops over each sentence, finding the token each entity starts on, and the token that each ends on
      let tokensArr = [];
      let charsArr = [];
      for (let entity of sentence.entities) {
        const { concept, startToken, tokenLength } = entity;
        tokensArr.push(startToken);
        tokensArr.push(startToken + (tokenLength - 1));
        //collects concepts text
        conceptsArr.push(concept);
      }
      // finds the characters that match up with each entities' start and end points
      for (let i = 0; i < tokensArr.length; i++) {
        // alternates, pushing the character that start each entity into the array, and then the character that the first token after the entity begins on. This is to facillitate turning each enttity into a substring
        if ((i + 1) % 2 === 0) {
          charsArr.push(sentence.tokenStartChars[tokensArr[i] + 1]);
        } else {
          charsArr.push(sentence.tokenStartChars[tokensArr[i]]);
        }
      }
      // create a series of substrings, alternating to determine if each substring is an entity or not. If so, it is marked as one to be handled later, when rendering text. Substrings are also made specially at the start and end of each sentence to allow the alternating to not be thrown off by an entity at the start or end of a sentence.
      for (let i = 0; i < charsArr.length; i++) {
        // controls for sentence start
        if (i === 0) {
          stringsArr.push({
            str: sentence.representation.substring(0, charsArr[i]),
            entity: false,
          });
        } else {
          if (i % 2 === 0) {
            stringsArr.push({
              str: sentence.representation.substring(
                charsArr[i - 1],
                charsArr[i]
              ),
              entity: false,
            });
          } else {
            stringsArr.push({
              str: sentence.representation.substring(
                charsArr[i - 1],
                charsArr[i]
              ),
              entity: true,
              entityCount,
            });
            entityCount++;
          }
        }
        // controls for sentence end
        if (i === charsArr.length - 1)
          stringsArr.push({
            str: sentence.representation.substring(charsArr[i]),
            entity: false,
          });
        // adds a space at the end of each sentence
        stringsArr.push({ str: ' ', entity: false });
      }
    }
    // sets the substrings into state
    setArticleData({ ...articleData, stringsArr, concepts: conceptsArr });
  };
  return (
    <div className='App'>
      <div className='article-text'>
        {/* dynamically creates the articles' text, checking to see if each substring is an entity or not, and providing styling/mouseover options accordingly */}
        {articleData.article ? (
          <h1 className='header'> {article.title}</h1>
        ) : null}
        {stringsArr.map((string, index) => {
          return string.entity ? (
            <span
              className='entity'
              key={index}
              onMouseEnter={e => handleMouseover(e, string.entityCount)}>
              {string.str}
            </span>
          ) : (
            <span key={index}>{string.str}</span>
          );
        })}
      </div>
      <div className='concept'>Concept: {conceptText ? conceptText : null}</div>
    </div>
  );
}

export default App;

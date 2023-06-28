/*
 * Copyright (c) 2023 Asim Ihsan.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { marked } from 'marked';
import Checklist from './Checklist';
import HtmlToReact from 'html-to-react';
import { Parser, ProcessNodeDefinitions } from 'html-to-react';
import parser = marked.parser;

function App() {
    const [markdown, setMarkdown] = useState('');
    const [html, setHtml] = useState('');
    const [activeTab, setActiveTab] = useState('markdown');
    const [checkboxStates, setCheckboxStates] = useState({});
    const [reactElements, setReactElements] = useState<React.ReactNode[]>([]);

    const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMarkdown(event.target.value);
    };

    const handleButtonClick = (event: React.FormEvent) => {
        event.preventDefault();
        let parsedHtml = marked(
            markdown, {
                gfm: true,
                breaks: true,
                mangle: false,
                headerIds: false,
            });

        // Remove the disabled attribute from the HTML string
        parsedHtml = parsedHtml.replace(/ disabled=""/g, '');

        setHtml(parsedHtml);
        setActiveTab('checklist');

        // Parse the raw HTML into React elements
        // @ts-ignore
        const parser = new Parser();
        const reactElements = parser.parse(parsedHtml);

        // Traverse the tree and replace the checkboxes with controlled components
        // @ts-ignore
        const newReactElements = reactElements.map((element, index) => {
            if (element.type === 'input' && element.props.type === 'checkbox') {
                const isChecked = element.props.checked !== undefined;
                // @ts-ignore
                return <input type="checkbox" checked={checkboxStates[index] || isChecked} onChange={(event) => handleCheckboxChange(index, event)} key={index} />;
            }
            return element;
        });

        // Initialize the checked state of each checkbox
        // @ts-ignore
        const initialCheckboxStates = newReactElements.reduce((acc, element, index) => {
            if (element.type === 'input' && element.props.type === 'checkbox') {
                acc[index] = element.props.checked;
            }
            return acc;
        }, {});
        setCheckboxStates(initialCheckboxStates);
        setReactElements(newReactElements);
    };

    // @ts-ignore
    const handleCheckboxChange = (index, event) => {
        setCheckboxStates(prevStates => {
            const newStates = { ...prevStates, [index]: event.target.checked };

            // Recursively update the display style of all descendants
            // @ts-ignore
            const updateDisplayStyle = (element) => {
                // @ts-ignore
                if (element.type === 'li' && element.props.parentIndex === index) {
                    // @ts-ignore
                    element.props.style.display = newStates[index] ? 'block' : 'none';
                }
                if (element.props.children) {
                    element.props.children.forEach(updateDisplayStyle);
                }
            };
            reactElements.forEach(updateDisplayStyle);

            return newStates;
        });
    };

    // @ts-ignore
    const convertReactElementToMarkdown = (elements, level = 0) => {
        let markdown: string[] = [];

        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        console.log('elements');
        console.log(elements);

        // @ts-ignore
        elements.forEach((element) => {
            if (typeof element !== 'object' || element === null) {
                markdown.push(element);
            } else if (React.isValidElement(element)) {
                if (element.type === 'li') {
                    console.log('li');
                    console.log(element);

                    // @ts-ignore
                    const checkbox = element.props.children[0];

                    // @ts-ignore
                    const text = element.props.children[1];
                    const isChecked = checkbox.props.checked;

                    console.log('checkbox');
                    console.log(checkbox);
                    console.log('text');
                    console.log(text);
                    console.log('isChecked');
                    console.log(isChecked);

                    markdown.push(`${'  '.repeat(level)}- [${isChecked ? 'x' : ' '}] ${text}`);

                    // @ts-ignore
                    if (element.props.children.length > 2) {

                        // @ts-ignore
                        markdown.push(convertReactElementToMarkdown(element.props.children[2], level + 1));
                    }
                } else if (element.type === 'ul') {
                    // @ts-ignore
                    markdown.push(convertReactElementToMarkdown(element.props.children, level));
                }
            }
        });
        return markdown.join('');
    };

    const handleCopyToClipboard = () => {
        if (!html) {
            console.error('HTML is empty');
            return;
        }

        // @ts-ignore
        const parser = new HtmlToReact.Parser();
        const reactElements = parser.parse(html);

        if (!reactElements || !Array.isArray(reactElements)) {
            console.error('Failed to parse HTML into React elements');
            return;
        }

        const markdown = convertReactElementToMarkdown(reactElements);
        const tempInput = document.createElement('textarea');

        // @ts-ignore
        tempInput.style = 'position: absolute; left: -1000px; top: -1000px';

        tempInput.value = markdown;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
    };

    return (
        <div className="App container">
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'markdown' ? 'active' : ''}`} onClick={() => setActiveTab('markdown')}>Markdown</button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'checklist' ? 'active' : ''}`} onClick={() => setActiveTab('checklist')}>Checklist</button>
                </li>
            </ul>
            <div className="tab-content">
                <div className={`tab-pane ${activeTab === 'markdown' ? 'active' : ''}`} id="markdown">
                    <form onSubmit={handleButtonClick}>
                        <textarea className="form-control" value={markdown} onChange={handleMarkdownChange} />
                        <input type="submit" className="btn btn-primary" value="Generate Checklist" />
                    </form>
                </div>
                <div className={`tab-pane ${activeTab === 'checklist' ? 'active' : ''}`} id="checklist">
                    <button className="btn btn-primary" onClick={handleCopyToClipboard}>Copy to Clipboard</button>
                    <Checklist reactElements={reactElements} checkboxStates={checkboxStates} handleCheckboxChange={handleCheckboxChange} />
                </div>
            </div>
        </div>
    );
}

export default App;

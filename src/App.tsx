import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { marked } from 'marked';
import Checklist from './Checklist';
import HtmlToReact from 'html-to-react';
import {tab} from "@testing-library/user-event/dist/tab";

function App() {
    const [markdown, setMarkdown] = useState('');
    const [html, setHtml] = useState('');
    const [activeTab, setActiveTab] = useState('markdown');

    const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMarkdown(event.target.value);
    };

    const handleButtonClick = (event: React.FormEvent) => {
        event.preventDefault();
        const parsedHtml = marked(
            markdown, {
                gfm: true,
                breaks: true,
                mangle: false,
                headerIds: false,
            });
        setHtml(parsedHtml);
        setActiveTab('checklist');
    };

    // @ts-ignore
    const convertReactElementToMarkdown = (elements, level = 0) => {
        let markdown: string[] = [];

        if (!Array.isArray(elements)) {
            elements = [elements];
        }

        console.log(elements);

        // @ts-ignore
        elements.forEach((element) => {
            if (typeof element !== 'object' || element === null) {
                markdown.push(element);
            } else if (React.isValidElement(element)) {
                if (element.type === 'li') {

                    // @ts-ignore
                    const checkbox = element.props.children[0];

                    // @ts-ignore
                    const text = element.props.children[1];
                    const isChecked = checkbox.props.checked;

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
                    <Checklist html={html} />
                </div>
            </div>
        </div>
    );
}

export default App;

import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { marked } from 'marked';
import Checklist from './Checklist';
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
                    <Checklist html={html} />
                </div>
            </div>
        </div>
    );
}

export default App;

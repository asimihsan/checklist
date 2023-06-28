import React, {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { marked } from 'marked';
import Checklist from './Checklist';

function App() {
    const [markdown, setMarkdown] = useState('');
    const [html, setHtml] = useState('');

    const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMarkdown(event.target.value);
    };

    const handleButtonClick = () => {
        const parsedHtml = marked(
            markdown, {
                gfm: true,
                breaks: true,
                mangle: false,
                headerIds: false,
            });
        setHtml(parsedHtml);
    };

    return (
        <div className="App container">
            <div className="row">
                <div className="col">
                    <textarea className="form-control" value={markdown} onChange={handleMarkdownChange} />
                </div>
                <div className="col">
                    <button className="btn btn-primary" onClick={handleButtonClick}>Generate Checklist</button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Checklist html={html} />
                </div>
            </div>
        </div>
    );
}

export default App;
